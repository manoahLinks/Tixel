;; -----------------------------------------------------------
;; Errors
;; -----------------------------------------------------------

(define-constant ERR_EVENT_NOT_FOUND (err u100))
(define-constant ERR_INVALID_QUANTITY (err u101))
(define-constant ERR_EVENT_CANCELLED (err u102))
(define-constant ERR_SOLD_OUT (err u103))
(define-constant ERR_UNAUTHORIZED (err u111))
(define-constant ERR_MAX_QTY_EXCEEDED (err u113))

;; -----------------------------------------------------------
;; Traits
;; -----------------------------------------------------------

(define-trait sip010-ft-trait
  (
    (transfer (uint principal principal (optional (buff 34)))
              (response bool uint))
  )
)

;; -----------------------------------------------------------
;; Storage
;; -----------------------------------------------------------

(define-data-var next-event-id uint u1)

(define-map events
  { event-id: uint }
  {
    name: (string-utf8 64),
    venue: (string-utf8 64),
    city: (string-utf8 64),
    date: uint,
    max-tickets: uint,
    price-usdcx: uint,
    organizer: principal,
    tickets-sold: uint,
    is-cancelled: bool,
    token-uri: (string-ascii 256)
  }
)

(define-map tickets
  { event-id: uint, buyer: principal }
  uint
)

;; -----------------------------------------------------------
;; Event Management
;; -----------------------------------------------------------

(define-public (create-event
  (name (string-utf8 64))
  (venue (string-utf8 64))
  (city (string-utf8 64))
  (date uint)
  (max-tickets uint)
  (price-usdcx uint)
  (token-uri (string-ascii 256))
)
  (let ((event-id (var-get next-event-id)))
    (asserts! (> max-tickets u0) ERR_INVALID_QUANTITY)

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

    (var-set next-event-id (+ event-id u1))

    (begin
      (print {
        type: "event-created",
        event-id: event-id,
        organizer: tx-sender,
        max-tickets: max-tickets,
        price-usdcx: price-usdcx,
        date: date
      })
      (ok event-id)
    )
  )
)

(define-read-only (get-event (event-id uint))
  (map-get? events { event-id: event-id })
)

(define-read-only (get-next-event-id)
  (ok (var-get next-event-id))
)

;; -----------------------------------------------------------
;; Ticket Minting Helper
;; -----------------------------------------------------------

(define-private (mint-up-to-10
  (event-id uint)
  (recipient principal)
  (token-uri (string-ascii 256))
  (start-serial uint)
  (quantity uint)
)
  (begin
    (if (>= quantity u1)  (try! (contract-call? .event-nft mint-for-event recipient event-id (+ start-serial u0) token-uri)) true)
    (if (>= quantity u2)  (try! (contract-call? .event-nft mint-for-event recipient event-id (+ start-serial u1) token-uri)) true)
    (if (>= quantity u3)  (try! (contract-call? .event-nft mint-for-event recipient event-id (+ start-serial u2) token-uri)) true)
    (if (>= quantity u4)  (try! (contract-call? .event-nft mint-for-event recipient event-id (+ start-serial u3) token-uri)) true)
    (if (>= quantity u5)  (try! (contract-call? .event-nft mint-for-event recipient event-id (+ start-serial u4) token-uri)) true)
    (if (>= quantity u6)  (try! (contract-call? .event-nft mint-for-event recipient event-id (+ start-serial u5) token-uri)) true)
    (if (>= quantity u7)  (try! (contract-call? .event-nft mint-for-event recipient event-id (+ start-serial u6) token-uri)) true)
    (if (>= quantity u8)  (try! (contract-call? .event-nft mint-for-event recipient event-id (+ start-serial u7) token-uri)) true)
    (if (>= quantity u9)  (try! (contract-call? .event-nft mint-for-event recipient event-id (+ start-serial u8) token-uri)) true)
    (if (>= quantity u10) (try! (contract-call? .event-nft mint-for-event recipient event-id (+ start-serial u9) token-uri)) true)
    (ok true)
  )
)

;; -----------------------------------------------------------
;; Ticket Purchase
;; -----------------------------------------------------------

(define-public (purchase-ticket
  (event-id uint)
  (quantity uint)
  (payment-token <sip010-ft-trait>)
)
  (let (
    (event (unwrap! (map-get? events { event-id: event-id }) ERR_EVENT_NOT_FOUND))
    (sold (get tickets-sold event))
    (max (get max-tickets event))
    (price (get price-usdcx event))
    (organizer (get organizer event))
  )
    (asserts! (> quantity u0) ERR_INVALID_QUANTITY)
    (asserts! (<= quantity u10) ERR_MAX_QTY_EXCEEDED)
    (asserts! (not (get is-cancelled event)) ERR_EVENT_CANCELLED)
    (asserts! (<= (+ sold quantity) max) ERR_SOLD_OUT)

    (let (
      (required (* price quantity))
      (start-serial (+ sold u1))
    )
      (if (is-eq required u0)
        true
        (try! (contract-call? payment-token transfer required tx-sender organizer none))
      )

      (try! (mint-up-to-10 event-id tx-sender (get token-uri event) start-serial quantity))

      (map-set events { event-id: event-id }
        (merge event { tickets-sold: (+ sold quantity) })
      )

      (let ((current (default-to u0 (map-get? tickets { event-id: event-id, buyer: tx-sender }))))
        (map-set tickets { event-id: event-id, buyer: tx-sender } (+ current quantity))
      )

      (begin
        (print {
          type: "ticket-purchased",
          event-id: event-id,
          buyer: tx-sender,
          quantity: quantity,
          total-paid: required,
          first-serial: start-serial
        })
        (ok { event-id: event-id, first-serial: start-serial, quantity: quantity })
      )
    )
  )
)

;; -----------------------------------------------------------
;; Cancellation
;; -----------------------------------------------------------

(define-public (cancel-event (event-id uint))
  (let ((event (unwrap! (map-get? events { event-id: event-id }) ERR_EVENT_NOT_FOUND)))
    (asserts! (is-eq (get organizer event) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (not (get is-cancelled event)) ERR_EVENT_CANCELLED)

    (map-set events { event-id: event-id }
      (merge event { is-cancelled: true })
    )

    (begin
      (print {
        type: "event-cancelled",
        event-id: event-id,
        organizer: tx-sender
      })
      (ok true)
    )
  )
)

;; -----------------------------------------------------------
;; Views
;; -----------------------------------------------------------

(define-read-only (get-user-tickets (event-id uint) (buyer principal))
  (default-to u0 (map-get? tickets { event-id: event-id, buyer: buyer }))
)
