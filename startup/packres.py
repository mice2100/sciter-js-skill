from sys import platform
import os

sciter_path = os.path.join(os.path.expanduser('~'), 'Downloads', 'sciter-js-sdk-6.0.2.17')
if platform=='darwin':
    packutil = os.path.join(sciter_path, 'bin', 'macosx', 'packfolder')
else:
    packutil = os.path.join(sciter_path, 'bin', 'windows', 'packfolder.exe')

os.system(f'{packutil} src/ui src/resources.cpp')
