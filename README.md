如何用gitignore去忽略相应的文件夹呢？如temp
可以这样做：
1. 在项目根目录下创建.gitignore文件
2. 在.gitignore文件中添加temp
3. git add .gitignore
4. git commit -m "add .gitignore"
5. git push origin master
6. git rm -r --cached temp
7. git commit -m "remove temp"
8. git push origin master
