export function generateWalkthrough(files, depGraph) {
    const steps = [];
    const relPaths = files.map(f => f.relativePath);
    // Step 1: Entry Point / Bootstrapping
    const entryCandidate = files.find(f => f.relativePath.startsWith('bin/') ||
        f.relativePath.includes('main.') ||
        f.relativePath.includes('index.ts') ||
        f.relativePath.includes('index.js') ||
        f.relativePath.includes('server.ts') ||
        f.relativePath.includes('app.py')) || files[0];
    if (entryCandidate) {
        steps.push({
            stepNumber: 1,
            title: 'The Starting Gate: Entry Point & Bootstrapping',
            targetFile: entryCandidate.relativePath,
            keyLines: [1, Math.min(entryCandidate.lineCount, 40)],
            summary: `This is where execution begins when you run the application. It parses initial configuration, registers dependencies, and kicks off the main runtime loop.`,
            whatToNotice: [
                'Notice how command line flags or environment configurations are parsed.',
                'Follow how services, databases, or HTTP listeners are instantiated.',
                'Observe the primary dispatch call that transfers control to the core modules.',
            ],
            conceptExplained: 'Like opening the front door of a building: everything gets unlocked and initialized here before visitors arrive.',
        });
    }
    // Step 2: Types, Models & Schemas
    const modelCandidate = files.find(f => f.relativePath.includes('types.') ||
        f.relativePath.includes('model') ||
        f.relativePath.includes('schema') ||
        f.relativePath.includes('interfaces'));
    if (modelCandidate) {
        steps.push({
            stepNumber: 2,
            title: 'The Blueprint: Core Data Models & Schemas',
            targetFile: modelCandidate.relativePath,
            keyLines: [1, Math.min(modelCandidate.lineCount, 50)],
            summary: `Understanding the data structures is the fastest way to understand any program. This file defines the shapes, entities, and contracts used across the entire codebase.`,
            whatToNotice: [
                'Look at the primary nouns in this system (e.g. Project, Task, User, Config).',
                'Identify which fields are required versus optional.',
                'See how validation rules or relationships are expressed.',
            ],
            conceptExplained: 'Fred Brooks famous rule: Show me your flowcharts and conceal your tables, and I shall continue to be mystified. Show me your tables, and I won’t usually need your flowcharts; they’ll be obvious.',
        });
    }
    // Step 3: Core Logic / Service Engine
    const coreCandidate = files.find(f => (f.relativePath.includes('engine') ||
        f.relativePath.includes('service') ||
        f.relativePath.includes('core') ||
        f.relativePath.includes('lib/')) &&
        !f.relativePath.includes('types') &&
        f.relativePath !== entryCandidate?.relativePath);
    if (coreCandidate) {
        steps.push({
            stepNumber: 3,
            title: 'The Workhorse: Core Business Logic',
            targetFile: coreCandidate.relativePath,
            keyLines: [1, Math.min(coreCandidate.lineCount, 60)],
            summary: `This is where the actual problem is solved. It takes raw inputs, applies the application’s domain rules, and produces calculated results or state transitions.`,
            whatToNotice: [
                'Notice the primary functions or methods doing the heavy lifting.',
                'Observe how errors are caught and surfaced.',
                'Note how side-effects (like disk writes or network calls) are kept isolated.',
            ],
            conceptExplained: 'The kitchen of the restaurant: this is where the raw ingredients (data models) get transformed into finished meals.',
        });
    }
    // Step 4: External Interface / API / UI
    const interfaceCandidate = files.find(f => (f.relativePath.includes('routes') ||
        f.relativePath.includes('controller') ||
        f.relativePath.includes('components') ||
        f.relativePath.includes('web/') ||
        f.relativePath.includes('api/')) &&
        f.relativePath !== entryCandidate?.relativePath &&
        f.relativePath !== coreCandidate?.relativePath);
    if (interfaceCandidate) {
        steps.push({
            stepNumber: 4,
            title: 'The Counter: API Routes & User Interface',
            targetFile: interfaceCandidate.relativePath,
            keyLines: [1, Math.min(interfaceCandidate.lineCount, 50)],
            summary: `How the outside world interacts with this system. It receives requests, validates permissions, calls the core engine, and packages up the response.`,
            whatToNotice: [
                'How parameters and inputs from users or external systems are received.',
                'The handoff point where the interface delegates work to the core services.',
                'How HTTP response codes or visual feedback states are returned.',
            ],
            conceptExplained: 'The storefront or service desk: it speaks the customer’s language and coordinates with the kitchen in the back.',
        });
    }
    // Step 5: Testing & Verification Harness
    const testCandidate = files.find(f => f.relativePath.includes('.test.') ||
        f.relativePath.includes('.spec.') ||
        f.relativePath.startsWith('test') ||
        f.relativePath.startsWith('tests'));
    if (testCandidate) {
        steps.push({
            stepNumber: 5,
            title: 'The Safety Net: Automated Tests & Validation',
            targetFile: testCandidate.relativePath,
            keyLines: [1, Math.min(testCandidate.lineCount, 50)],
            summary: `Tests are the living documentation of how the code is expected to behave. Reading a test reveals real-world examples of how to invoke functions and what they return.`,
            whatToNotice: [
                'See realistic sample inputs and expected outputs.',
                'Notice edge cases or error scenarios being tested explicitly.',
                'Run this test whenever making changes to ensure you haven’t broken existing guarantees.',
            ],
            conceptExplained: 'The quality inspector at the end of the assembly line: verifying every product matches the promise before it leaves the factory.',
        });
    }
    // Ensure step numbers are consecutive
    steps.forEach((s, idx) => {
        s.stepNumber = idx + 1;
    });
    return steps;
}
