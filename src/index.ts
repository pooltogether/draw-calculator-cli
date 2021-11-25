import { Command } from "commander";
import { run } from "./run";

const worker = require("./workers/calculatePrizeForUser");

async function index() {
    const program = new Command();
    program
        .requiredOption(
            "-c, --chainId <string>",
            "select network (mainnet, rinkeby, polygon or binance)"
        )
        .requiredOption("-t, --ticket <string>", "ticket contract address")

        .requiredOption("-d, --drawId <string>", "drawId to perform lookup for")
        .requiredOption("-o, --outputDir <string>", "relative path to output resulting JSON blob");
    program.parse(process.argv);
    const options = program.opts();
    const chainId = options.chainId;
    const ticket = options.ticket;
    const drawId = options.drawId;
    const outputDir = options.outputDir;

    await run(chainId, ticket, drawId, outputDir);
}

index();
