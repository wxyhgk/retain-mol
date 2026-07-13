# 20260713T104618Z-GDG1223

- 评分：80.000
- 通过：否
- 失败分类：core-geometry, peripheral-placement, xtb-failed
- 原始候选评分：80.000
- GFN2-xTB：failed

## 下一轮诊断

- 母核附近几何偏差较大；检查并环、键级和初始构象。
- 外围片段位置偏差较大；优先调整片段模板、连接方向和二面角。
- GFN2-xTB 精修失败：xTB did not produce optimized coordinates:
            -0.3746036             -10.1935
       205                         -0.3607813              -9.8174
       ...                                ...                  ...
       398                         25.4297771             691.9795
      -------------------------------------------------------------
                  HL-Gap            0.0026601 Eh            0.0724 eV
             Fermi-level           -0.4117358 Eh          -11.2039 eV

 SCC (total)                   0 d,  0 h,  0 min,  6.636 sec
 SCC setup                      ...        0 min,  0.001 sec (  0.018%)
 Dispersion                     ...        0 min,  0.003 sec (  0.045%)
 classical contributions        ...        0 min,  0.001 sec (  0.017%)
 integral evaluation            ...        0 min,  0.043 sec (  0.646%)
 iterations                     ...        0 min,  6.333 sec ( 95.425%)
 molecular gradient             ...        0 min,  0.252 sec (  3.798%)
 printout                       ...        0 min,  0.003 sec (  0.051%)

########################################################################
[ERROR] Program stopped due to fatal error
-3- Single point calculation terminated
-2- xtb_calculator_singlepoint: Electronic structure method terminated
-1- scf: Self consistent charge iterator did not converge
########################################################################

abnormal termination of xtb
Note: The following floating-point exceptions are signalling: IEEE_INVALID_FLAG IEEE_OVERFLOW_FLAG IEEE_UNDERFLOW_FLAG
ERROR STOP 

Error termination. Backtrace:
#0  0x105708983
#1  0x105709557
#2  0x10570a793
#3  0x1046fae63
#4  0x1045eddf3
#5  0x1048c5c57

ERROR conda.cli.main_run:execute(127): `conda run xtb /var/folders/59/nlw8jr4n6dggwwmfw3mjzcjh0000gn/T/retainmol_loop_xtb_vit_vwsa/input.xyz --opt normal --gfn 2 --chrg 0 --uhf 0 --cycles 500 --parallel 1 --input /var/folders/59/nlw8jr4n6dggwwmfw3mjzcjh0000gn/T/retainmol_loop_xtb_vit_vwsa/xcontrol.inp` failed. (See above for error)

