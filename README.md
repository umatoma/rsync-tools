# rsync-tools
rsync tools

# Requirement
- Node.js (4.x+)
- rsync

# Install
```bash
$ npm install -g https://github.com/umatoma/rsync-tools.git
```

# Usage
```bash
$ rst --help
rsync-tools (v1.0.2)

Usage:
$ rst <command> [options]

Commands:
  watch        Watch files and exec rsync command
  sync-local   Synchronize the local to the server
  sync-remote  Synchronize the server to the local

Options:
  --debug    Debug mode                                                [boolean]
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]

Report bugs to github issue.
github: https://github.com/umatoma/rsync-tools
```

# Config File
.rsync-tool.json
```javascript
{
  "destination": "umatoma@target.umatoma.net:/path/to/project/",
  "source": "/path/to/project/", // default: cwd
  "exclude": ["secret.key", "tmp/"] // default: []
  "shell": "ssh", // default: ssh
  "flags": "azr" // default: azr
}
```