# demand analysis

两部分, 一是线的数据产生, 二是展示  

## 数据

数据, 输入是量子线路-array2d, H门指定旋转方向-bool, xyz指定组-bool, 有量子反馈的xyz(似乎体现为标数字), 

gate set { X Y Z H S T Sd Td Rz? Rx? Ry? CX CZ? CY? MX MY MZ MCX MCY MCZ }, 其中MC.是由测量结果驱动的经典控制

gate demo:
```
X x0 x1
Rx45_1
h h_1
cz1_0 cz2
td_0
mcx1_1 mcx2
```

circult demo:
```
h  ,   ,    ,    
cx1,cx2,    ,    
   ,cx3,cx4 ,    
   ,   ,cx5 ,cx6 
   ,   ,    ,mx  
   ,   ,mcy2,mcy1
```

cnot cz 似乎也有需要指定的要素

输出是每个格子(两个格点坐标)有四个入口点四个出口点, 以及可能的标数字以及相位  

## 展示

展示部分涉及 

线作为联通整体, 但是有复杂的互相遮挡

鼠标悬停: 高亮整条线, 点击: 旋转H=>导致拼接变化, 标点的切换=>点数统计的变化. 

## 界面

文本输入, 无输入1~5秒后格式化

视角?

图形

面板:当前的联通的线数, 悬停的线的点数

