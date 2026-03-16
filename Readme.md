
# ⛰️ TifaLang (ⵜⵉⴼⴰⵍⴰⵏⴳ)

TifaLang is a professional, bytecode-powered programming language that uses the **Tifinagh script** natively. It is a completely independent ecosystem designed to bring modern software engineering to the Amazigh community.

## 🚀 Worldwide Quick Start

Install TifaLang on any Mac or Linux machine with a single worldwide command:

```bash
curl -fsSL https://raw.githubusercontent.com/rayan4-dot/Tifalang/main/get-tifa.sh | bash
```

## 💎 Key Achievements
- **Python-Free Identity**: Implementation details are hidden; it's 100% TifaLang.
- **Single-Binary Power**: One file contains the Compiler, VM, and Standard Libraries.
- **Pure Tifinagh**: All keywords (`ⵜⴰⵡⵓⵔⵉ`, `ⵉⵎⴰ`, `ⵎⴰ`) and built-ins use Tifinagh Unicode.
- **Global Distribution**: Self-bootstrapping installer built into the CLI.

## 🎮 Basic Usage

### Create a Project
```bash
tifa new my_app
```

### Run Code
```bash
tifa run my_app/ⴰⵎⵣⵡⴰⵔⵓ.tifa
```

### Interactive Command Line
```bash
tifa
```

## 📦 Building from Source
If you want to contribute to the engine:
1. Clone the repo.
2. Edit files in `.ⴰⵙⵏⵉⵏ/`.
3. Bundle the new binary:
   ```bash
   python3 -m zipapp stage -o tifa -p "/usr/bin/env python3"
   ```

## 📜 License
MIT
