(use-trait eventToken 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)
;; Counter for unique event IDs
(define-data-var next-event-id uint u1)

;; Map to store events
(define-map events
  { event-id: uint }
  {
    name: (string-ascii 64),
    venue: (string-ascii 64),
    date: uint,
    max-tickets: uint,
    price: uint,
    organizer: principal,
    tickets-sold: uint,
    is-cancelled: bool
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
    (name (string-ascii 64))
    (venue (string-ascii 64))
    (date uint)
    (max-tickets uint)
    (price uint))
  (let
    (
      (event-id (var-get next-event-id))
    )
    ;; Store the event
    (map-set events
      { event-id: event-id }
      {
        name: name,
        venue: venue,
        date: date,
        max-tickets: max-tickets,
        price: price,
        organizer: tx-sender,
        tickets-sold: u0,
        is-cancelled: false
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

;; Purchase tickets for an event
(define-public (purchase-ticket (event-nft <eventToken>) (event-id uint) (quantity uint) (stx-amount uint))
  (let
    (
      (event (unwrap! (map-get? events { event-id: event-id }) (err u100)))
      (user (get organizer event))
    )
    (asserts! (> quantity u0) (err u101))
    (asserts! (not (get is-cancelled event)) (err u102))
    (asserts! (<= (+ (get tickets-sold event) quantity) (get max-tickets event)) (err u103))

    ;; Update tickets sold
    (map-set events { event-id: event-id }
      (merge event { tickets-sold: (+ (get tickets-sold event) quantity) })
    )

    ;; Update buyer's ticket balance
    (let
      (
        (current (default-to u0 (map-get? tickets { event-id: event-id, buyer: tx-sender })))
      )
      (map-set tickets { event-id: event-id, buyer: tx-sender } (+ current quantity))
    )

    (try! (stx-transfer? stx-amount tx-sender user))

    (try! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.ticket-nft mint tx-sender))

    (ok u1)
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
      (event (unwrap! (map-get? events { event-id: event-id }) (err "Event does not exist")))
    )
    (asserts! (is-eq (get organizer event) tx-sender) (err "Only the organizer can cancel"))
    (asserts! (not (get is-cancelled event)) (err "Already cancelled"))

    (map-set events { event-id: event-id }
      (merge event { is-cancelled: true })
    )

    ;; Refund logic not implemented yet
    (ok "Event cancelled successfully")
  )
)
