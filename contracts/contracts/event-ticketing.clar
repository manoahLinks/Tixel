(define-constant ERR_EVENT_NOT_FOUND (err u100))
(define-constant ERR_INVALID_QUANTITY (err u101))
(define-constant ERR_EVENT_CANCELLED (err u102))
(define-constant ERR_SOLD_OUT (err u103))
(define-constant ERR_NOT_INITIALIZED (err u110))
(define-constant ERR_UNAUTHORIZED (err u111))
(define-constant ERR_INVALID_PRICE (err u112))
(define-constant ERR_MAX_QTY_EXCEEDED (err u113))

;; Minimal SIP-010 transfer trait (USDCx should implement this).
(define-trait sip010-ft-trait
  (
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
  )
)

;; Counter for unique event IDs
(define-data-var next-event-id uint u1)

;; Map to store events
(define-map events
  { event-id: uint }
  {
    name: (string-utf8 64),
    venue: (string-utf8 64),
    city: (string-utf8 64),
    date: uint,
    max-tickets: uint,
    ;; micro-USDCx (6 decimals)
    price-usdcx: uint,
    organizer: principal,
    tickets-sold: uint,
    is-cancelled: bool,
    ;; event-level metadata URI (used for ticket NFTs)
    token-uri: (string-ascii 256)
  }
)

;; Map to track ticket ownership
;; key = (event-id, buyer), value = number of tickets
(define-map tickets
  { event-id: uint, buyer: principal }
  uint
)

;; -----------------------------------------------------------
;; Event Functions
;; -----------------------------------------------------------

;; Create a new event
(define-public (create-event 
    (name (string-utf8 64))
    (venue (string-utf8 64))
    (city (string-utf8 64))
    (date uint)
    (max-tickets uint)
    (price-usdcx uint)
    (token-uri (string-ascii 256)))
  (let
    (
      (event-id (var-get next-event-id))
    )
    (asserts! (> max-tickets u0) ERR_SOLD_OUT)
    ;; Store the event
    (map-set events
      { event-id: event-id }
      {
        name: name,
        venue: venue,
        city: city,
        date: date,
        max-tickets: max-tickets,
        price-usdcx: price-usdcx,
        organizer: tx-sender,
        tickets-sold: u0,
        is-cancelled: false,
        token-uri: token-uri
      }
    )
    ;; Increment event ID for next event
    (var-set next-event-id (+ event-id u1))
    ;; Return the new event ID
    (ok event-id)
  )
)

;; Get event details
(define-read-only (get-event (event-id uint))
  (map-get? events { event-id: event-id })
)

;; -----------------------------------------------------------
;; Ticketing Functions
;; -----------------------------------------------------------

;; Mint up to 10 ticket NFTs in a single purchase (no loops/recursion in Clarity).
(define-private (mint-up-to-10
  (event-id uint)
  (recipient principal)
  (token-uri (string-ascii 256))
  (start-serial uint)
  (quantity uint)
)
  (begin
    (if (>= quantity u1) (begin (try! (contract-call? .ticketss-nft mint-for-event recipient event-id (+ start-serial u0) token-uri)) true) true)
    (if (>= quantity u2) (begin (try! (contract-call? .ticketss-nft mint-for-event recipient event-id (+ start-serial u1) token-uri)) true) true)
    (if (>= quantity u3) (begin (try! (contract-call? .ticketss-nft mint-for-event recipient event-id (+ start-serial u2) token-uri)) true) true)
    (if (>= quantity u4) (begin (try! (contract-call? .ticketss-nft mint-for-event recipient event-id (+ start-serial u3) token-uri)) true) true)
    (if (>= quantity u5) (begin (try! (contract-call? .ticketss-nft mint-for-event recipient event-id (+ start-serial u4) token-uri)) true) true)
    (if (>= quantity u6) (begin (try! (contract-call? .ticketss-nft mint-for-event recipient event-id (+ start-serial u5) token-uri)) true) true)
    (if (>= quantity u7) (begin (try! (contract-call? .ticketss-nft mint-for-event recipient event-id (+ start-serial u6) token-uri)) true) true)
    (if (>= quantity u8) (begin (try! (contract-call? .ticketss-nft mint-for-event recipient event-id (+ start-serial u7) token-uri)) true) true)
    (if (>= quantity u9) (begin (try! (contract-call? .ticketss-nft mint-for-event recipient event-id (+ start-serial u8) token-uri)) true) true)
    (if (>= quantity u10) (begin (try! (contract-call? .ticketss-nft mint-for-event recipient event-id (+ start-serial u9) token-uri)) true) true)
    (ok true)
  )
)

;; Purchase tickets for an event using USDCx (via SIP-010-style `transfer` on `payment-token`)
(define-public (purchase-ticket (event-id uint) (quantity uint) (payment-token <sip010-ft-trait>))
  (let
    (
      (event (unwrap! (map-get? events { event-id: event-id }) ERR_EVENT_NOT_FOUND))
      (organizer (get organizer event))
      (token-uri (get token-uri event))
      (sold (get tickets-sold event))
      (max (get max-tickets event))
      (price (get price-usdcx event))
    )
    (asserts! (> quantity u0) ERR_INVALID_QUANTITY)
    (asserts! (<= quantity u10) ERR_MAX_QTY_EXCEEDED)
    (asserts! (not (get is-cancelled event)) ERR_EVENT_CANCELLED)
    (asserts! (<= (+ sold quantity) max) ERR_SOLD_OUT)
    (let
      (
        (required (* price quantity))
        (start-serial (+ sold u1))
      )
      ;; Transfer payment (micro-USDCx) to organizer (skip if free)
      (if (is-eq required u0)
        true
        (begin
          (try! (contract-call? payment-token transfer required tx-sender organizer none))
        )
      )

      ;; Mint ticket NFTs
      (try! (mint-up-to-10 event-id tx-sender token-uri start-serial quantity))

      ;; Update tickets sold
      (map-set events { event-id: event-id }
        (merge event { tickets-sold: (+ sold quantity) })
      )

      ;; Update buyer's ticket balance (convenience getter)
      (let ((current (default-to u0 (map-get? tickets { event-id: event-id, buyer: tx-sender }))))
        (map-set tickets { event-id: event-id, buyer: tx-sender } (+ current quantity))
      )

      (ok { event-id: event-id, first-serial: start-serial, quantity: quantity })
    )
  )
)

;; Get ticket balance for a user
(define-read-only (get-user-tickets (event-id uint) (buyer principal))
  (default-to u0 (map-get? tickets { event-id: event-id, buyer: buyer }))
)

;; Cancel an event (only organizer can cancel)
(define-public (cancel-event (event-id uint))
  (let
    (
      (event (unwrap! (map-get? events { event-id: event-id }) ERR_EVENT_NOT_FOUND))
    )
    (asserts! (is-eq (get organizer event) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (not (get is-cancelled event)) ERR_EVENT_CANCELLED)

    (map-set events { event-id: event-id }
      (merge event { is-cancelled: true })
    )

    ;; Refund logic not implemented yet
    (ok true)
  )
)
