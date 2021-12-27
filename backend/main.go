package main

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"log"
	"math/big"
	"os"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

func main() {
	fmt.Println("Deploy and Interact with Evmos Contract")

	// Initialize ethclient to be Evmos local network
	client, err := ethclient.Dial("http://localhost:8545")
	if err != nil {
		log.Fatal("Unable to connect to Evmos local network: %s", err)
	}

	// Get private key of validator account from Environment Variable
	privateKey, err := crypto.HexToECDSA(os.Getenv("ACCT_PRIV_KEY"))
	if err != nil {
		log.Fatal("Unable to retrieve private key from Env Var: %s", err)
	}

	// Get public key from private key and cast to ECDSA
	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatal("Error casting public key to ECDSA")
	}

	// Retrieve public address of key and generate nonce for new tx
	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)
	nonce, err := client.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		log.Fatal(err)
	}

	// Estimate gas price for transaction
	gasPrice, err := client.SuggestGasPrice(context.Background())
	if err != nil {
		log.Fatal(err)
	}

	// Create a keyed transactor so that we can sign tx
	auth := bind.NewKeyedTransactor(privateKey)
	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)     // in wei
	auth.GasLimit = uint64(300000) // in units
	auth.GasPrice = gasPrice

	// Deploy Token.sol contract
	address, tx, instance, err := DeployToken(auth, client)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Successfully deployed contract")
	fmt.Println("Contract Address: ", address.Hex())
	fmt.Println("Transaction Hash: ", tx.Hash().Hex())

	_ = instance
}
