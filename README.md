## Introduction
This is a small walkthrough of how to run an Evmos node on your local testnet and how to use Golang to deploy a solidity smart contract and interact with it through a locally hosted UI.

### 1. Running and deploying the code
This is a two part series where 
* a) we will configure and spin up a local testnet Evmos node 
* b) we will use Golang to compile and deploy our smart contract then interact with it

#### Spinning up a local node
Follow the [Evmos Quick Start](https://evmos.dev/quickstart/) guide to get started on downloading and installing all the necessary libraries and tools. Once you get to the `Run a Node` section, you can either run the bash script that's been automatically setup via `./init.sh` from your base directory, or you can follow along the steps below.

1. Start off by setting the env variables to be used.
* `MONIKER=testing`
* `KEYRING=test`
* `CHAINID=evmos_9000-1`
* `VAL_KEY=my_validator`

2. Initialize the validators's and node's configuration files using your specific moniker, key-ring, and chain-id (you can also use the -o flag to overwrite the genesis.json file).
* `evmosd init $MONIKER --keyring-backend $KEYRING --chain-id $CHAINID -o`

3. Set up the validator account and add it as a genesis account and assign it some funds to be able to run commands.
* `evmosd keys add $VAL_KEY --keyring-backend $KEYRING --chain-id $CHAINID`
* `evmosd add-genesis-account $VAL_KEY 10000000000aphoton --keyring-backend $KEYRING --chain-id $CHAINID`

4. Run the following command to get the public address of the keyring account you just created.
* `evmosd keys list` or specifically `evmosd keys show $VAL_KEY` and you'll be able to retrieve the public address for that key 

5. Generate a genesis transaction that will be used to create a validator with a self-delegation. Then collect the genesis transactions that will be added to genesis.json so the node can run with the correct information on the validator account you created in the previous step.
* `evmosd gentx $VAL_KEY 1000000aphoton --keyring-backend=$KEYRING --chain-id=$CHAINID \
--moniker=$MONIKER \
--commission-max-change-rate=0.01 \
--commission-max-rate=1.0 \
--commission-rate=0.07`
* `evmosd collect-gentxs --keyring-backend $KEYRING --chain-id $CHAINID`

6. Validate that the genesis.json file you have is correct then run the full node.
* `evmosd validate-genesis --keyring-backend $KEYRING --chain-id $CHAINID`
* `evmosd start --keyring-backend $KEYRING --chain-id $CHAINID`

7. Once the node is running, you can check the balance on the account you just created by running the command below. If it works, this means the node is running with the correct genesis data that includes the account you created earlier.
* `evmosd query bank balances $(evmosd keys show $VAL_KEY -a) --keyring-backend=$KEYRING --chain-id=$CHAINID`

**NOTE:**
If these steps don't work, try `evmosd unsafe-reset-all` to reset everything and start again.


#### Interacting with the Node
This step assumes you already have the files setup for your smart contract, main.go, and App.js. If not, you can pull this repo and follow the commands as is.

1. Begin by moving into the `/backend/` subfolder
* `cd {PATH_TO_DIR}/backend`

2. Run these commands to generate the ABI to be able to deploy from Go.
* `abigen --sol=contracts/Token.sol --pkg=main --out=token.go`
* `go run main.go token.go`
  * This will deploy the smart contract and will print the contract address in the terminal after the text `Contract Address:`
  * Copy the newly deployed contract address into the variable `tokenAddress` in the App.js

3. Run these commands to generate a .json version of the ABI metadata then copy it to the frontend `src/artifacts/` directory so it can be used in the frontend to interact with the contract.
* `solc --abi contracts/Token.sol -o artifacts`
  * This will generate the `Token.abi` file and put it under the directory `backend/artifacts/`
* `mkdir ../frontend/src/artifacts && cp ./artifacts/Token.abi ../frontend/src/artifacts/TokenABI.json`

4. In a separate terminal window, cd into the frontend/ directory and run the following to start the local client.
* `cd {PATH_TO_DIR}/frontend`
* `yarn build` or `npm build`
* `yarn run start` or `npm start`

From here, you can interact with the UI by setting your address, querying for the account's balance, and using a recipient address to send some amount of tokens you specify.