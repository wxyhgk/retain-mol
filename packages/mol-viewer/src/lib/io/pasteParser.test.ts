import { describe, it, expect } from 'vitest'
import { detectPasteFormat, parseGJF, parseRawCoords, parseClipboard } from './pasteParser'

const XYZ_METHANE = `5
methane
C  0.0000  0.0000  0.0000
H  0.6293  0.6293  0.6293
H -0.6293 -0.6293  0.6293
H -0.6293  0.6293 -0.6293
H  0.6293 -0.6293 -0.6293`

const GJF_METHANE = `%chk=methane.chk
%nproc=4
%mem=4GB
#p B3LYP/6-31G(d) opt freq

Methane optimization

0 1
C    0.000000    0.000000    0.000000
H    0.629300    0.629300    0.629300
H   -0.629300   -0.629300    0.629300
H   -0.629300    0.629300   -0.629300
H    0.629300   -0.629300   -0.629300

`

const GJF_WITH_FREEZE = `#p opt

title

0 1
C  0  0.0  0.0  0.0
H  0  1.0  0.0  0.0
H -1  0.0  1.0  0.0

`

const RAW_COORDS = `C  0.0  0.0  0.0
H  1.0  0.0  0.0
H  0.0  1.0  0.0`

describe('detectPasteFormat', () => {
  it('识别 XYZ', () => {
    expect(detectPasteFormat(XYZ_METHANE)).toBe('xyz')
  })
  it('识别 GJF（带 % 指令）', () => {
    expect(detectPasteFormat(GJF_METHANE)).toBe('gjf')
  })
  it('识别 GJF（只有 # 路由）', () => {
    expect(detectPasteFormat(GJF_WITH_FREEZE)).toBe('gjf')
  })
  it('识别裸坐标', () => {
    expect(detectPasteFormat(RAW_COORDS)).toBe('raw')
  })
  it('识别 MOL', () => {
    expect(detectPasteFormat('name\n\n\n  2  1  0  0  0  0  0  0  0  0999 V2000\n')).toBe('mol')
  })
  it('未知格式', () => {
    expect(detectPasteFormat('hello world\nfoo bar')).toBe('unknown')
  })
})

describe('parseGJF', () => {
  it('解析完整 GJF', () => {
    const mol = parseGJF(GJF_METHANE)
    expect(mol.atoms.length).toBe(5)
    expect(mol.atoms[0].symbol).toBe('C')
    expect(mol.name).toBe('Methane optimization')
  })

  it('解析带冻结标记的 GJF', () => {
    const mol = parseGJF(GJF_WITH_FREEZE)
    expect(mol.atoms.length).toBe(3)
    expect(mol.atoms[0].x).toBe(0)
    expect(mol.atoms[1].x).toBe(1)
  })

  it('坐标精度保留', () => {
    const mol = parseGJF(GJF_METHANE)
    expect(mol.atoms[1].x).toBeCloseTo(0.6293)
    expect(mol.atoms[2].y).toBeCloseTo(-0.6293)
  })

  it('自动推断成键', () => {
    const mol = parseGJF(GJF_METHANE)
    expect(mol.bonds.length).toBeGreaterThan(0)
  })
})

describe('parseRawCoords', () => {
  it('解析三行裸坐标', () => {
    const mol = parseRawCoords(RAW_COORDS)
    expect(mol.atoms.length).toBe(3)
    expect(mol.atoms[0].symbol).toBe('C')
  })

  it('忽略无效行', () => {
    const mol = parseRawCoords(`C 0 0 0\nrandom text\nH 1 0 0`)
    expect(mol.atoms.length).toBe(2)
  })
})

describe('parseClipboard（统一入口）', () => {
  it('XYZ 路径', () => {
    const { format, molecule } = parseClipboard(XYZ_METHANE)
    expect(format).toBe('xyz')
    expect(molecule.atoms.length).toBe(5)
  })

  it('GJF 路径', () => {
    const { format, molecule } = parseClipboard(GJF_METHANE)
    expect(format).toBe('gjf')
    expect(molecule.atoms.length).toBe(5)
  })

  it('未知格式抛错', () => {
    expect(() => parseClipboard('随便写点什么')).toThrow()
  })
})
