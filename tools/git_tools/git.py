import os

search_dir = os.path.join(os.getcwd(), "OneClick-stable-diffusion")

# find all subdirectories
for root, dirs, files in os.walk(search_dir):
  # check if the file exists in the current directory
  if "gitPushHelper.py" in files:
    # build the path to the file
    path = os.path.join(root, "gitPushHelper.py")
    # run the file
    os.system(f"python {path}")
