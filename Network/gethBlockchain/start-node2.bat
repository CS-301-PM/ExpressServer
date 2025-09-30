@echo off
cd /d "%~dp0"
geth --datadir node2 --networkid 12345 --port 30302 --http --http.addr "127.0.0.1" --http.port 8502 --http.corsdomain "*" --http.api "eth,net,web3,personal,miner" --mine --miner.etherbase 0x28c477f0B44776B565d9706FE6a8e4e78E2F76Fc --unlock 0x28c477f0B44776B565d9706FE6a8e4e78E2F76Fc --password node2\password.txt --allow-insecure-unlock --nodiscover console
