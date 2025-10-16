#!/usr/bin/env node
/* eslint-env node */
/* eslint no-console: "off" */

/**
 * new-package — interactive scaffold for a new TypeScript package in a pnpm monorepo
 * No external deps. ESM-only.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";

const consoleRef = globalThis.console;

const VERSION = "0.2.0";

// Defaults (can be overridden via env)
const DEFAULTS = {
  template: process.env.NEW_PACKAGE_DEFAULT_TEMPLATE ?? "lib",
  license: process.env.NEW_PACKAGE_DEFAULT_LICENSE ?? "MIT",
  registry: process.env.NEW_PACKAGE_DEFAULT_REGISTRY ?? "https://npm.pkg.github.com",
  scope: process.env.NEW_PACKAGE_DEFAULT_SCOPE ?? "poh8479",
  changeset: process.env.NEW_PACKAGE_DEFAULT_CHANGESET ?? "yes", // yes | no
};

const HELP = `
new-package — scaffold a new TypeScript package in a pnpm monorepo

USAGE
  new-package            # interactive mode (recommended)
  new-package --yes      # accept defaults (non-interactive)
  new-package --help
  new-package --version

ENV DEFAULTS
  NEW_PACKAGE_DEFAULT_TEMPLATE   (basic|lib|react|react-native)
  NEW_PACKAGE_DEFAULT_LICENSE    (MIT|Apache-2.0|UNLICENSED)
  NEW_PACKAGE_DEFAULT_REGISTRY   (URL)
  NEW_PACKAGE_DEFAULT_SCOPE      (scope without @)
  NEW_PACKAGE_DEFAULT_CHANGESET  (yes|no)
`.trim();

function die(msg, code = 1) {
  consoleRef.error(`\n\x1b[31mError:\x1b[0m ${msg}\n`);
  consoleRef.log(HELP);
  process.exit(code);
}

function ensureDirEmpty(absPath) {
  if (fs.existsSync(absPath)) {
    const files = fs.readdirSync(absPath);
    if (files.length) die(`Target directory is not empty: ${absPath}`);
  } else {
    fs.mkdirSync(absPath, { recursive: true });
  }
}

function writeJSON(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n");
}

function asBool(input, def = true) {
  if (input === undefined || input === null || input === "") return def;
  const s = String(input).toLowerCase();
  return ["y", "yes", "true", "1"].includes(s);
}

async function promptInteractive() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    consoleRef.log("\n✨ Let’s scaffold a new package\n");

    const scope = (await rl.question(`Scope (without @) [${DEFAULTS.scope}]: `)) || DEFAULTS.scope;

    let baseName = await rl.question("Package name (kebab-case, no scope): ");
    if (!baseName) die("Package name is required.");
    if (!/^[a-z0-9][a-z0-9-]*$/.test(baseName)) {
      die("Package name must be kebab-case (letters, numbers, dashes).");
    }

    const name = `@${scope}/${baseName}`;

    const templates = ["basic", "lib", "react", "react-native"];
    const tmplInput =
      (await rl.question(`Template ${templates.join("/")} [${DEFAULTS.template}]: `)) ||
      DEFAULTS.template;
    const template = templates.includes(tmplInput)
      ? tmplInput
      : die(`Invalid template: ${tmplInput}`);

    const licenses = ["MIT", "Apache-2.0", "UNLICENSED"];
    const licenseInput =
      (await rl.question(`License ${licenses.join("/")} [${DEFAULTS.license}]: `)) ||
      DEFAULTS.license;
    const license = licenses.includes(licenseInput)
      ? licenseInput
      : die(`Invalid license: ${licenseInput}`);

    const isPrivate = asBool(await rl.question("Private package? (y/N): "), false);

    let registry = "";
    if (!isPrivate && license !== "UNLICENSED") {
      registry =
        (await rl.question(`Publish registry [${DEFAULTS.registry}]: `)) || DEFAULTS.registry;
    }

    const dirInput = await rl.question(`Target directory [packages/${baseName}]: `);
    const dir = dirInput || `packages/${baseName}`;

    const createChangeset = asBool(
      await rl.question(`Create initial changeset? (y/N) [${DEFAULTS.changeset}]: `),
      DEFAULTS.changeset === "yes",
    );

    return { name, template, license, isPrivate, registry, dir, createChangeset };
  } finally {
    rl.close();
  }
}

function scaffold({ name, template, license, isPrivate, registry, dir, createChangeset }) {
  const root = process.cwd();
  const abs = path.resolve(root, dir);
  ensureDirEmpty(abs);

  const isReact = template === "react" || template === "react-native";

  const pkg = {
    name: `@Pieter-OHearn/${name}`,
    version: "0.0.1",
    type: "module",
    sideEffects: false,
    main: "./dist/index.cjs",
    module: "./dist/index.js",
    types: "./dist/index.d.ts",
    exports: {
      ".": {
        types: "./dist/index.d.ts",
        import: "./dist/index.js",
        require: "./dist/index.cjs",
      },
    },
    files: ["dist"],
    scripts: {
      build: "tsc -p tsconfig.json",
      clean: "rimraf dist",
      prepublishOnly: "pnpm run clean && pnpm run build",
      test: "node -e \"console.log('no tests yet')\"",
      lint: "node -e \"console.log('no lint yet')\"",
    },
    devDependencies: {
      typescript: "^5.9.0",
      rimraf: "^6.0.1",
    },
  };

  if (license !== "UNLICENSED") {
    pkg.license = license;
  } else {
    pkg.private = true;
  }

  if (isPrivate) {
    pkg.private = true;
  } else if (registry) {
    pkg.publishConfig = { access: "restricted", registry };
  }

  if (isReact) {
    pkg.peerDependencies = { react: "^18.0.0" };
    if (template === "react-native") {
      pkg.peerDependencies["react-native"] = "*";
    }
  }

  const tsconfig = {
    extends: "../../tsconfig.base.json",
    compilerOptions: {
      outDir: "./dist",
      declaration: true,
      declarationMap: false,
      module: "NodeNext",
      moduleResolution: "NodeNext",
      target: "ES2021",
      lib: ["ES2021"],
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
    },
    include: ["src"],
    exclude: ["dist", "node_modules", "**/*.test.*", "**/__tests__/**"],
  };

  const indexTs =
    template === "basic" || template === "lib"
      ? `export function hello(name: string) { return \`Hello, \${name}!\`; }\n`
      : template === "react"
        ? `import { useMemo } from "react";\nexport function useHello(name: string){return useMemo(()=>\`Hello, \${name}\`,[name]);}\n`
        : `import { useMemo } from "react";\nexport function useHello(name: string){return useMemo(()=>\`Hello, \${name} (RN)\`,[name]);}\n`;

  const readme = `# ${name}

Scaffolded with \`new-package\`.

## Install

\`\`\`sh
pnpm add ${name}
\`\`\`

## Usage

\`\`\`ts
import { ${template === "lib" || template === "basic" ? "hello" : "useHello"} } from "${name}";
\`\`\`
`;

  writeJSON(path.join(abs, "package.json"), pkg);
  writeJSON(path.join(abs, "tsconfig.json"), tsconfig);
  fs.mkdirSync(path.join(abs, "src"), { recursive: true });
  fs.writeFileSync(path.join(abs, "src/index.ts"), indexTs);
  fs.writeFileSync(path.join(abs, "README.md"), readme);

  if (license !== "UNLICENSED") {
    const year = new Date().getFullYear();
    const mit = `MIT License

Copyright (c) ${year} Pieter O'Hearn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
`;
    if (license === "MIT") {
      fs.writeFileSync(path.join(abs, "LICENSE"), mit);
    } else if (license === "Apache-2.0") {
      fs.writeFileSync(
        path.join(abs, "LICENSE"),
        `Apache License 2.0\n\nYou can replace this with the full text or use your repo root LICENSE.`,
      );
    }
  }

  if (createChangeset) {
    const csDir = path.resolve(root, ".changeset");
    if (fs.existsSync(csDir)) {
      const md = `---
"${name}": minor
---

Initial release of ${name}.
`;
      const file = `${name.replace("@", "").replace("/", "-")}-init.md`;
      fs.writeFileSync(path.join(csDir, file), md);
    }
  }

  consoleRef.log(`\n✅ Created ${name} at ${dir}`);
  consoleRef.log(`   Next steps:`);
  consoleRef.log(`     pnpm -w -r build`);
}

function parseFlags(argv) {
  return {
    help: argv.includes("--help") || argv.includes("-h"),
    version: argv.includes("--version") || argv.includes("-v"),
    yes: argv.includes("--yes") || argv.includes("-y"),
  };
}

async function main() {
  const flags = parseFlags(process.argv);
  if (flags.help) {
    consoleRef.log(HELP);
    process.exit(0);
  }
  if (flags.version) {
    consoleRef.log(VERSION);
    process.exit(0);
  }

  if (flags.yes) {
    // Non-interactive: use defaults + quick questions from env
    const scope = DEFAULTS.scope;
    const baseName = process.env.NEW_PACKAGE_NAME ?? "my-lib";
    const name = `@${scope}/${baseName}`;

    scaffold({
      name,
      template: DEFAULTS.template,
      license: DEFAULTS.license,
      isPrivate: false,
      registry: DEFAULTS.registry,
      dir: `packages/${baseName}`,
      createChangeset: DEFAULTS.changeset === "yes",
    });
    return;
  }

  // Interactive flow
  const answers = await promptInteractive();
  scaffold(answers);
}

main();
