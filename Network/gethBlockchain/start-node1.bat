@echo off
cd /d "%~dp0"
geth --datadir node1 --networkid 12345 --port 30301 --http --http.addr "127.0.0.1" --http.port 8501 --http.corsdomain "*" --http.api "eth,net,web3,personal,miner" --mine --miner.etherbase 0x21C9070F598DDebFbdE257e96aE67972205d584f --unlock 0x21C9070F598DDebFbdE257e96aE67972205d584f --password node1\password.txt --allow-insecure-unlock --nodiscover console
