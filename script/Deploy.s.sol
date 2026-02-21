// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {CortexFactory} from "../src/CortexFactory.sol";
import {AgentVerifier} from "../src/AgentVerifier.sol";
import {CortexPayment} from "../src/CortexPayment.sol";

/// @title Deployment script for Cortex Protocol
/// @dev Run with: forge script script/Deploy.s.sol --rpc-url base --broadcast
contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying Cortex Protocol from:", deployer);

        // 1. Deploy AgentVerifier
        console.log("Deploying AgentVerifier...");
        vm.startBroadcast(deployerPrivateKey);
        
        AgentVerifier verifier = new AgentVerifier(deployer);
        console.log("AgentVerifier deployed at:", address(verifier));

        // 2. Deploy CortexPayment
        console.log("Deploying CortexPayment...");
        CortexPayment payment = new CortexPayment(deployer, deployer);
        console.log("CortexPayment deployed at:", address(payment));

        // 3. Set payment receiver on verifier
        verifier.setPaymentReceiver(address(payment));
        console.log("Payment receiver set on verifier");

        // 4. Deploy CortexFactory
        console.log("Deploying CortexFactory...");
        CortexFactory factory = new CortexFactory(deployer, deployer);
        console.log("CortexFactory deployed at:", address(factory));

        vm.stopBroadcast();

        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("AgentVerifier:", address(verifier));
        console.log("CortexPayment:", address(payment));
        console.log("CortexFactory:", address(factory));

        // Store addresses for verification
        console.log("\n=== VERIFICATION COMMANDS ===");
        console.log("export VERIFIER=", address(verifier));
        console.log("export PAYMENT=", address(payment));
        console.log("export FACTORY=", address(factory));
    }
}
