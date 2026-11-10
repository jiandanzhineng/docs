# 用法: python tool/route-anchors.py <build目录> <输出json>：导出所有 docs 网址及页内 id
import os,re,json,sys
root=sys.argv[1]; dst=sys.argv[2]
out={}
for dp,_,fs in os.walk(root):
    d=dp.replace(os.sep,'/')
    if 'index.html' in fs and '/docs' in d:
        rel='/'+os.path.relpath(dp,root).replace(os.sep,'/')
        h=open(os.path.join(dp,'index.html'),encoding='utf8').read()
        out[rel]=sorted(set(re.findall(r'\bid="([^"]+)"',h)))
json.dump(out,open(dst,'w',encoding='utf8'),ensure_ascii=False,indent=0)
print(len(out))
