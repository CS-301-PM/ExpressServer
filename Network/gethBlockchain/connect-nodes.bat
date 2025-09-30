@echo off
echo Setting up P2P connections between nodes...
echo.
echo Instructions:
echo 1. Start all three nodes in separate command windows using:
echo    - start-node1.bat
echo    - start-node2.bat  
echo    - start-node3.bat
echo.
echo 2. In each node console, get the enode URL by typing: admin.nodeInfo.enode
echo.
echo 3. Connect nodes by running in each console:
echo    admin.addPeer("enode://[NODE_ID]@127.0.0.1:[PORT]")
echo.
echo Node Ports:
echo - Node1: 30301 (RPC: 8501)
echo - Node2: 30302 (RPC: 8502)
echo - Node3: 30303 (RPC: 8503)
echo.
pause