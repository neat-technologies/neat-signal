import json, sys, os, re
run=sys.argv[1]
path=os.path.join(run,"stream.tsv")
events=[]
for line in open(path, errors="replace"):
    if "\t" not in line: continue
    ts,js=line.split("\t",1)
    try: o=json.loads(js)
    except: continue
    events.append((float(ts),o))
t0=events[0][0] if events else 0.0
def blocks(o):
    try: return o["message"]["content"] or []
    except: return []
tool_uses={}   # id -> (ts, name, input)
results={}     # tool_use_id -> (ts, content_str)
edits=[]       # (ts, has_session, has_token) for Edit/Write
usage=None; cost=None
for ts,o in events:
    typ=o.get("type")
    if typ=="assistant":
        for b in blocks(o):
            if isinstance(b,dict) and b.get("type")=="tool_use":
                tool_uses[b.get("id")]=(ts,b.get("name"),b.get("input") or {})
                nm=b.get("name"); inp=json.dumps(b.get("input") or {})
                if nm in ("Edit","Write","MultiEdit"):
                    edits.append((ts, "session_id" in inp, "token_id" in inp))
    elif typ=="user":
        for b in blocks(o):
            if isinstance(b,dict) and b.get("type")=="tool_result":
                c=b.get("content")
                if isinstance(c,list): c=" ".join(str(x.get("text","")) if isinstance(x,dict) else str(x) for x in c)
                results[b.get("tool_use_id")]=(ts,str(c))
    elif typ=="result":
        u=o.get("usage") or {}
        usage=sum(u.get(k,0) or 0 for k in ("input_tokens","output_tokens","cache_read_input_tokens","cache_creation_input_tokens"))
        cost=o.get("total_cost_usd")
# contract-service calls + which result delivered session_id
cs_calls=[]
for tuid,(ts,name,inp) in tool_uses.items():
    if name=="Bash" and "contract-service" in json.dumps(inp):
        rts,rc = results.get(tuid,(None,""))
        cs_calls.append({"call_ts":ts,"result_ts":rts,"delivered_session_id":("session_id" in rc)})
cs_calls.sort(key=lambda x:x["call_ts"])
t_inject=next((c["result_ts"] for c in cs_calls if c["delivered_session_id"] and c["result_ts"]), None)
runtime_accepted = t_inject is not None
# incorporation: an Edit/Write writing session_id AFTER the injection was delivered
t_incorp=None
if t_inject is not None:
    for ts,hs,ht in sorted(edits):
        if ts>=t_inject and hs: t_incorp=ts; break
incorporated = t_incorp is not None
# verify.txt
v={}
try:
    for kv in open(os.path.join(run,"verify.txt")).read().split():
        if "=" in kv: k,val=kv.split("=",1); v[k]=val
except: pass
effect_verified = (v.get("client_token_id")=="0" and int(v.get("client_session_id","0"))>0 and v.get("tsc_rc")=="0")
out={
 "arm": v.get("arm"), "model": v.get("model"),
 "t0": 0.0,
 "t_inject_rel": round(t_inject-t0,2) if t_inject else None,
 "t_incorp_rel": round(t_incorp-t0,2) if t_incorp else None,
 "task_end_rel": round(events[-1][0]-t0,2) if events else None,
 "steer_latency_s": round(t_incorp-t_inject,2) if (t_inject and t_incorp) else None,
 "contract_fetches": len(cs_calls),
 "runtime_accepted": runtime_accepted,
 "incorporated_by_agent": incorporated,
 "effect_verified": effect_verified,
 "edits_total": len(edits),
 "edits_session_after_inject": sum(1 for ts,hs,ht in edits if t_inject and ts>=t_inject and hs),
 "tokens": usage, "cost_usd": cost,
 "verify": v,
}
print(json.dumps(out, indent=2))
