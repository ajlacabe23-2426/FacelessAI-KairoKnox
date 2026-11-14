"""Generate original narration for the 54-second RLS Micro Learning review."""
import sys
import numpy as np
import generate_narration as g

g.DURATION=54.0
g.EPISODES={"micro":[
    (0.35,"A successful login does not guarantee your data is safe.",7.0),
    (4.05,"Watch what happens at the database.",7.0),
    (7.30,"Two fictional accounts share an invoices table.",15.0),
    (11.10,"Each row belongs to just one user.",15.0),
    (15.25,"Without row security, assume both have read access.",22.0),
    (19.00,"User A receives both invoices. Isolation fails.",22.0),
    (22.30,"Enable row level security in PostgreSQL.",32.0),
    (25.80,"In Supabase, a select policy compares the row owner",32.0),
    (29.30,"with the signed in user's identity.",32.0),
    (32.30,"Now the same query returns only A's own invoice.",43.0),
    (36.50,"The other record is filtered out by the database.",43.0),
    (40.35,"No client side hiding required.",43.0),
    (43.25,"Verify isolation independently as both ordinary users.",54.0),
    (47.30,"Test writes too, with separate policies.",54.0),
    (50.40,"Identity is not the same as permission.",54.0),
]}
def bed(name):
    t=np.arange(round(g.SAMPLE_RATE*g.DURATION),dtype=np.float32)/g.SAMPLE_RATE
    signal=(0.006*np.sin(2*np.pi*92*t)+0.002*np.sin(2*np.pi*138*t)).astype(np.float32)
    for sec in [7,15,22,32,43,48]:
        start=round(sec*g.SAMPLE_RATE)
        tau=np.arange(round(.18*g.SAMPLE_RATE),dtype=np.float32)/g.SAMPLE_RATE
        signal[start:start+len(tau)]+=.021*np.exp(-23*tau)*np.sin(2*np.pi*590*tau)
    signal[-round(.4*g.SAMPLE_RATE):]*=np.linspace(1,0,round(.4*g.SAMPLE_RATE))
    return signal
g.original_bed=bed
if __name__=="__main__":
    g.main()
