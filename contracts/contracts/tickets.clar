
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)


(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_TOKEN_OWNER (err u101))
(define-constant ERR_NOT_INITIALIZED (err u102))

;; Admin can set the minter (event contract principal).
(define-data-var admin (optional principal) none)
(define-data-var minter (optional principal) none)

;; Ticket NFT: 1 NFT == 1 ticket
(define-non-fungible-token ticket uint)

(define-data-var last-token-id uint u0)

;; Extra metadata so we can map a ticket back to an event.
(define-map ticket-info
  { token-id: uint }
  { event-id: uint, serial: uint }
)

;; Simple on-chain token URI storage (SIP-009 compatible).
(define-map token-uris
  { token-id: uint }
  (string-ascii 256)
)

;; -----------------------------------------------------------
;; SIP-009 / nft-trait functions
;; -----------------------------------------------------------

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
  (ok (map-get? token-uris { token-id: token-id }))
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? ticket token-id))
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR_UNAUTHORIZED)
    (nft-transfer? ticket token-id sender recipient)
  )
)

;; -----------------------------------------------------------
;; Ticket-specific helpers
;; -----------------------------------------------------------

(define-read-only (get-admin)
  (var-get admin)
)

(define-read-only (get-minter)
  (var-get minter)
)

;; One-time set admin (first call), then only admin can update minter.
(define-public (set-minter (new-minter principal))
  (begin
    (if (is-none (var-get admin))
      (var-set admin (some tx-sender))
      (asserts! (is-eq tx-sender (unwrap-panic (var-get admin))) ERR_UNAUTHORIZED)
    )
    (var-set minter (some new-minter))
    (ok true)
  )
)

(define-read-only (get-ticket-info (token-id uint))
  (map-get? ticket-info { token-id: token-id })
)

;; Mint one ticket NFT. Intended to be called from `.event-ticketings`.
(define-public (mint-for-event
  (recipient principal)
  (event-id uint)
  (serial uint)
  (token-uri (string-ascii 256))
)
  (begin
    (asserts! (is-some (var-get minter)) ERR_NOT_INITIALIZED)
    (asserts! (is-eq contract-caller (unwrap-panic (var-get minter))) ERR_UNAUTHORIZED)
    (let ((token-id (+ (var-get last-token-id) u1)))
      (try! (nft-mint? ticket token-id recipient))
      (map-set ticket-info { token-id: token-id } { event-id: event-id, serial: serial })
      (map-set token-uris { token-id: token-id } token-uri)
      (var-set last-token-id token-id)
      (ok token-id)
    )
  )
)

;; Optional burn (for future check-in / invalidation).
(define-public (burn (token-id uint))
  (let ((owner (nft-get-owner? ticket token-id)))
    (asserts! (is-some owner) ERR_NOT_TOKEN_OWNER)
    ;; allow the ticket owner to burn their own ticket
    (asserts! (is-eq tx-sender (unwrap-panic owner)) ERR_UNAUTHORIZED)
    (try! (nft-burn? ticket token-id (unwrap-panic owner)))
    (ok true)
  )
)