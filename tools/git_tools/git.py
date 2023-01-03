import os

# find all subdirectories
for root, dirs, files in os.walk(os.getcwd()):
  # check if the file exists in the current directory
  if "gitPushHelper.py" in files:
    # build the path to the file
    path = os.path.join(root, "gitPushHelper.py")
    # run the file
    os.system(f"python {path}")
