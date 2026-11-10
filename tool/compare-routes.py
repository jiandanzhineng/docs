# 用法: python tool/compare-routes.py <新build目录> [基线json，默认 tmp/baseline/routes.json]
# 对比 tmp/baseline/routes.json：列出消失的网址和消失的锚点
import json,subprocess,sys,os
new=sys.argv[1]; subprocess.run([sys.executable,'tool/route-anchors.py',new,'tmp/baseline/new.json'],check=True)
a=json.load(open(sys.argv[2] if len(sys.argv)>2 else 'tmp/baseline/routes.json',encoding='utf8')); b=json.load(open('tmp/baseline/new.json',encoding='utf8'))
miss=[r for r in a if r not in b]
print('消失的网址:',miss or '无')
for r in sorted(a):
    if r in b:
        lost=[i for i in a[r] if i not in b[r] and not i.startswith('__')]
        if lost: print('锚点消失',r,lost)
print('新增网址:',[r for r in b if r not in a])
