(define-constant ERR_UNAUTHORIZED (err u100))

;; Simple SIP-010-ish mock token for simnet tests.
;; Amounts are in micro-units (6 decimals) by convention.
(define-fungible-token usdcx)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance usdcx who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply usdcx))
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-symbol)
  (ok "USDCx")
)

(define-read-only (get-name)
  (ok "Mock USDCx")
)

;; Mint for tests / local dev.
(define-public (mint (amount uint) (recipient principal))
  (ft-mint? usdcx amount recipient)
)

;; SIP-010 transfer signature (common form)
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR_UNAUTHORIZED)
    (ft-transfer? usdcx amount sender recipient)
  )
)

