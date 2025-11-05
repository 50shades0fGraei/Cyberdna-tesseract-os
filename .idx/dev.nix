{ pkgs, ... }: {
  # The Nix channel determines which versions of packages are available.
  # 'stable-24.05' is a good choice for most projects.
  channel = "stable-24.05";

  # This is a list of all the packages that will be installed in your
  # environment. You can find more packages at https://search.nixos.org/packages.
  packages = [
    pkgs.nodejs_20
    pkgs.typescript
    pkgs.nodePackages.ts-node
    pkgs.python3
    pkgs.pip
    pkgs.svelte-language-server
  ];

  # These are environment variables that will be available in your workspace.
  env = {
    API_KEY = "your-secret-key";
  };

  # This section configures the IDE itself.
  idx = {
    # A list of VS Code extensions to install from the Open VSX Registry.
    extensions = [
      "vscodevim.vim"
      "svelte.svelte-vscode"
      "ms-python.python"
    ];
    
    # Workspace lifecycle hooks.
    workspace = {
      # Runs when a workspace is first created.
      onCreate = {
        npm-install = "npm install";
        pip-install = "pip install -r requirements.txt";
      };
      # Runs every time the workspace is (re)started.
      onStart = {
        start-server = "npm run dev";
      };
    };

    # Configure a web preview for your application.
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT"];
          manager = "web";
        };
      };
    };
  };
}
