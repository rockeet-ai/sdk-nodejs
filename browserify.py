"""
Copyright (c) 2022 Philipp Scheer
"""


import os
import shutil


_ = os.path.dirname(os.path.realpath(__file__))


# create a new, empty output directory
shutil.rmtree(f"{_}/build", ignore_errors=True)
os.makedirs(f"{_}/build", exist_ok=True)
shutil.rmtree(f"{_}/dist", ignore_errors=True)
os.makedirs(f"{_}/dist", exist_ok=True)


# move the lib files in there
shutil.copytree(f"{_}/lib", f"{_}/build/lib", dirs_exist_ok=True)
shutil.copy(f"{_}/rockeet.js", f"{_}/build/rockeet.js")
shutil.copy(f"{_}/rockeetWeb.js", f"{_}/build/rockeetWeb.js")


# copy the web replacements
shutil.copytree(f"{_}/web", f"{_}/build/lib", dirs_exist_ok=True)


os.system(f"browserify -o {_}/dist/bundle.js {_}/build/rockeetWeb.js")
os.system(f"uglifyjs --compress --mangle -o {_}/dist/bundle.min.js {_}/dist/bundle.js")
