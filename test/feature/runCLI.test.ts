import { spawn } from 'child_process';

describe('run CLI tool ()', () => {
    it('runCLICommand', async () => {
        const runCLICommand = spawn(
            'node',
            [
                '../../dist/index.js',
                '-c',
                '1',
                '-t',
                '0xdd4d117723C257CEe402285D3aCF218E9A8236E1',
                '-d',
                '8',
                '-o',
                './results',
            ],
            // { cwd: process.cwd() },
        );

        let data = '';

        runCLICommand.stdout.on('data', (data) => (data += data));
        runCLICommand.stderr.on('data', (data) => (data += data));

        runCLICommand.on('error', (error) => {
            console.log(`error: ${error.message}`);
        });

        const exitCode = await new Promise((resolve, reject) => {
            runCLICommand.on('close', resolve);
        });
        console.log('exitCode ', exitCode);
        console.log(data);
    });
});
