@echo off
cd /d "%~dp0"
geth --datadir node3 --networkid 12345 --port 30303 --http --http.addr "127.0.0.1" --http.port 8503 --http.corsdomain "*" --http.api "eth,net,web3,personal,miner" --mine --miner.etherbase 0x759CD9B0c9a53c61f9a48AA3c7Fe815ede6f95D3 --unlock 0x759CD9B0c9a53c61f9a48AA3c7Fe815ede6f95D3 --password node3\password.txt --allow-insecure-unlock --nodiscover console
