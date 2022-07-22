"""
Copyright (c) 2022 Philipp Scheer
"""


import os
import json
import subprocess


_ = os.path.dirname(os.path.realpath(__file__))


print("Bundling for browser...", end="", flush=True)
result = subprocess.run(["python3", os.path.join(_, "browserify.py")], cwd=_, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
if result.returncode == 0:
    print("done ✔️")
else:
    print("failed ❌")
    print(result.stdout)
    print(result.stderr)
    exit(1)

package = json.load(open(os.path.join(_, "package.json"), "r"))
# ask for a new version while printing the current one
version = package["version"]
newVersion = input(f"Enter a new version for the package (current= {version} ): ")
if newVersion == "":
    print("❌  exiting...")
    exit(1)
package["version"] = newVersion
json.dump(package, open(os.path.join(_, "package.json"), "w"), indent=4)

print("done ✔️")
print("Publishing...")

status = os.system("npm publish")

if status == 0:
    print("done ✔️")
    exit(0)
else:
    print("failed ❌")
    exit(1)
