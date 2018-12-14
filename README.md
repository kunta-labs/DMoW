# DMoW experiment

The most lightweight, decentralized, configurable machine (< 300 lines of code)

# Goal
To create the smallest foundation for a decentralized machine (following the same methods as the primary Kunta (http://kunta.io) protocol) 

# Notes 
- Each node is broker and Client
- Execute Isolated VM calls on conditions both set by config, and set by interactive 
- compute on peer
- compute on message
- compute on etc

Static Variable and Dynamic Variables

Push Object to VM, hash object, send across topics

each connection can be a topic, or topics can be dedicated for specific uses

*update each topic everytime current hash changes*

*TODO: document security auditing/pentesting*

*computation can be written in native JS*

# Experiment Dependenices

- Mosca
- MQTT (abstracts network layer)
- vm (abstract virtual machine layer)

# Usage
```bash
node dual.js [listener] [computation] [peer]
```

### Initial Node
```bash
node Protocol.js 1883 "console.log(fs);" 1883
```

### Peer example
```bash
node Protocol.js 1884 "sb.a = sb.a + 10 ;" 1883 --as-peer
```

# TODO:
- hash source code for version
- write blocks sequentially, not just if it is higher index than local copy
- document security by design
- finish first round of pentesting prior to release 0
