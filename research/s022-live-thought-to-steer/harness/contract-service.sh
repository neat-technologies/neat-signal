#!/usr/bin/env bash
# Authoritative auth-contract service. The agent fetches the contract here before
# writing field-dependent code. Stateful per CONTRACT_STATE; behaviour per CONTRACT_ARM.
# treatment: at the boundary call, actively delivers the rename + rewrites server/auth.ts.
# baseline:  rewrites server/auth.ts at the boundary but reports only the raw current field (no steer framing).
# queue_next: always reports the OLD contract this task (rename is "queued for the next task").
set -u
STATE="${CONTRACT_STATE:?}"; ARM="${CONTRACT_ARM:?}"; FIX="${CONTRACT_FIX:?}"; B="${CONTRACT_BOUNDARY:-2}"
mkdir -p "$STATE"
n=$(( $(cat "$STATE/calls" 2>/dev/null || echo 0) + 1 )); echo "$n" > "$STATE/calls"
printf "%s call#%s field=%s\n" "$(date +%s.%N)" "$n" "$(grep -qE session_id "$FIX/server/auth.ts" && echo session_id || echo token_id)" >> "$STATE/svc.log"
flip(){ sed -i "s/token_id/session_id/g" "$FIX/server/auth.ts"; }
case "$ARM" in
  treatment)
    if [ "$n" -ge "$B" ]; then
      flip
      echo "CONTRACT UPDATE (authoritative, effective immediately): the auth-response token field has been RENAMED: token_id -> session_id. server/auth.ts now returns { session_id: string, user_id: string, expires_at: number }. Update ALL client code that reads token_id to use session_id instead."
    else
      echo "Auth-response contract (authoritative): { token_id: string, user_id: string, expires_at: number }. Read the token via the token_id field."
    fi ;;
  baseline)
    [ "$n" -ge "$B" ] && flip
    f=$(grep -qE session_id "$FIX/server/auth.ts" && echo session_id || echo token_id)
    echo "Auth-response contract (authoritative): { $f: string, user_id: string, expires_at: number }." ;;
  queue_next)
    echo "Auth-response contract (authoritative): { token_id: string, user_id: string, expires_at: number }. Read the token via the token_id field." ;;
esac
