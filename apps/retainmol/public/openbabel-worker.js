/*
 * OpenBabel WASM UFF 优化 Worker（经典 Worker，非 ES module）
 *
 * 为什么是经典 worker 放 public：openbabel.js 是 emscripten/UMD 经典脚本，靠
 * importScripts 加载最省事（Vite 的 type:'module' worker 不支持 importScripts）。
 * 放 public 不经打包，避免 Vite 对 UMD glue 的处理冲突。
 *
 * OpenBabel 本体是 GPL —— 只在 app 层（private）使用，不进 mol-viewer 公开包。
 *
 * 消息协议：
 *   in : { id, sdf, forcefield?='UFF', steps?=300, tolerance?=1e-4 }
 *   out: { id, ok, coords?:[[x,y,z]...], energyBefore?, energyAfter?, reason? }
 */

// 相对 worker 自身 URL 定位 openbabel/ 资源（兼容非根 base 部署）
const OB_DIR = new URL('openbabel/', self.location.href).href
importScripts(OB_DIR + 'openbabel.js')

let OB = null
const ready = new Promise((resolve, reject) => {
  try {
    const inst = OpenBabelModule({
      locateFile: (p) => OB_DIR + p, // openbabel.wasm / openbabel.data
      print: () => {},
      printErr: () => {},
    })
    if (inst.calledRun) { OB = inst; resolve() }
    else inst.onRuntimeInitialized = () => { OB = inst; resolve() }
  } catch (e) {
    reject(e)
  }
})

self.onmessage = async (e) => {
  const { id, sdf, forcefield = 'UFF', steps = 300, tolerance = 1e-4 } = e.data
  let conv, mol, out
  try {
    await ready

    conv = new OB.ObConversionWrapper()
    conv.setInFormat('', 'sdf')
    mol = new OB.OBMol()
    conv.readString(mol, sdf)

    const FF = OB.OBForceField.FindForceField(forcefield)
    if (!FF) { self.postMessage({ id, ok: false, reason: `找不到力场 ${forcefield}` }); return }
    if (!FF.Setup(mol)) { self.postMessage({ id, ok: false, reason: `${forcefield} 无法为该结构分配原子类型` }); return }

    const energyBefore = FF.Energy(false)
    FF.ConjugateGradients(steps, tolerance, 1)
    FF.GetCoordinates(mol)
    const energyAfter = FF.Energy(false)

    const n = mol.NumAtoms()
    const coords = new Array(n)
    for (let i = 1; i <= n; i++) {
      const a = mol.GetAtom(i)
      coords[i - 1] = [a.GetX(), a.GetY(), a.GetZ()]
    }
    self.postMessage({ id, ok: true, coords, energyBefore, energyAfter })
  } catch (err) {
    self.postMessage({ id, ok: false, reason: String((err && err.message) || err) })
  } finally {
    // embind 对象需手动释放，避免 WASM 堆泄漏
    try { mol && mol.delete() } catch { /* noop */ }
    try { conv && conv.delete() } catch { /* noop */ }
    try { out && out.delete() } catch { /* noop */ }
  }
}
