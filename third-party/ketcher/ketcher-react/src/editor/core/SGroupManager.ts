import {
  type BaseMonomer,
  type Bond,
  Pile,
  SGroup,
  type Struct,
  type KetMonomerClass,
  type SGroupAttachmentPoint,
  Vec2,
  monomerFactory,
} from 'ketcher-core';

import { isNumber } from 'lodash';

type AttachmentPoint = Pick<
  SGroupAttachmentPoint,
  'atomId' | 'attachmentPointNumber'
>;
type EditableSGroup = SGroup & { monomer?: BaseMonomer };

type ExtBond = {
  bond: Bond;
  targetEndpoint: 'begin' | 'end';
  attachmentPointNumber?: number;
};

export interface ISGroupManager {
  getAtomsCenter(s: Struct, a: number[]): Vec2 | null;
  getAttachmentPointForBondEndpoint(
    p: ReadonlyArray<AttachmentPoint>,
    a: number,
    n?: number,
  ): AttachmentPoint | undefined;
  updateBondEndpointByAttachmentPoint(
    b: Bond,
    e: 'begin' | 'end',
    s: SGroup,
  ): boolean;
  getMonomerExternalBonds(s: Struct, g: SGroup): ExtBond[];
  deleteMonomerStructure(s: Struct, g: SGroup): void;
  setMonomerExpandedState(g: SGroup, e: boolean): void;
  cloneMonomer(m: BaseMonomer): BaseMonomer;
  getOriginalSelectedMonomerExpanded(s: Set<number>): boolean;
  cloneMonomerStructureToPosition(
    s: Struct,
    g: SGroup,
    c: Vec2,
    p: Vec2 | null,
    e: boolean,
  ): SGroup | undefined;
  reconnectMonomerExternalBonds(s: Struct, g: SGroup, b: ExtBond[]): void;
  replaceMatchingMonomerStructures(
    s: Struct,
    m: BaseMonomer,
    t: KetMonomerClass,
    sym: string,
    e: boolean,
    ids?: number[],
  ): void;
}

type Deps = { getOriginalStruct: () => Struct };

export class SGroupManager implements ISGroupManager {
  constructor(private deps: Deps) {}

  getAtomsCenter(s: Struct, a: number[]): Vec2 | null {
    let x = 0;
    let y = 0;
    let c = 0;
    a.forEach((id) => {
      const at = s.atoms.get(id);
      if (!at?.pp) return;
      x += at.pp.x;
      y += at.pp.y;
      c++;
    });
    return c > 0 ? new Vec2(x / c, y / c) : null;
  }

  getAttachmentPointForBondEndpoint(
    p: ReadonlyArray<AttachmentPoint>,
    a: number,
    n?: number,
  ): AttachmentPoint | undefined {
    const by = isNumber(n)
      ? p.find((x) => x.attachmentPointNumber === n)
      : undefined;
    return by ?? p.find((x) => x.atomId === a);
  }

  updateBondEndpointByAttachmentPoint(
    b: Bond,
    e: 'begin' | 'end',
    s: SGroup,
  ): boolean {
    const aid = e === 'begin' ? b.begin : b.end;
    const num =
      e === 'begin'
        ? b.beginSuperatomAttachmentPointNumber
        : b.endSuperatomAttachmentPointNumber;
    const ap = this.getAttachmentPointForBondEndpoint(
      s.getAttachmentPoints(),
      aid,
      num,
    );
    if (!ap) return false;
    if (e === 'begin') {
      b.begin = ap.atomId;
      b.beginSuperatomAttachmentPointNumber = ap.attachmentPointNumber;
    } else {
      b.end = ap.atomId;
      b.endSuperatomAttachmentPointNumber = ap.attachmentPointNumber;
    }
    return true;
  }

  getMonomerExternalBonds(s: Struct, g: SGroup): ExtBond[] {
    const ids = new Set<number>(SGroup.getAtoms(s, g));
    const aps = g.getAttachmentPoints();
    const getNum = (a: number, n?: number) =>
      this.getAttachmentPointForBondEndpoint(aps, a, n)
        ?.attachmentPointNumber ?? n;
    const out: ExtBond[] = [];
    s.bonds.forEach((b) => {
      const bi = ids.has(b.begin);
      const ei = ids.has(b.end);
      if (bi === ei) return;
      out.push({
        bond: b.clone(),
        targetEndpoint: bi ? 'begin' : 'end',
        attachmentPointNumber: bi
          ? getNum(b.begin, b.beginSuperatomAttachmentPointNumber)
          : getNum(b.end, b.endSuperatomAttachmentPointNumber),
      });
    });
    return out;
  }

  deleteMonomerStructure(s: Struct, g: SGroup): void {
    const ids = new Set<number>(SGroup.getAtoms(s, g));
    const del: number[] = [];
    s.bonds.forEach((b, id) => {
      if (ids.has(b.begin) || ids.has(b.end)) del.push(id);
    });
    del.forEach((id) => s.bonds.delete(id));
    if (s.sgroups.get(g.id)) s.sGroupDelete(g.id);
    ids.forEach((id) => s.atoms.delete(id));
  }

  setMonomerExpandedState(g: SGroup, e: boolean): void {
    g.data.expanded = e;
    const m = (g as EditableSGroup).monomer;
    if (m?.monomerItem) m.monomerItem.expanded = e;
  }

  cloneMonomer(m: BaseMonomer): BaseMonomer {
    const [M] = monomerFactory(m.monomerItem);
    return new M(m.monomerItem, new Vec2(m.position));
  }

  getOriginalSelectedMonomerExpanded(s: Set<number>): boolean {
    let e = true;
    this.deps.getOriginalStruct().sgroups.forEach((g) => {
      if (
        g.isMonomer &&
        g.atoms.length === s.size &&
        g.atoms.every((id) => s.has(id))
      )
        e = g.isExpanded();
    });
    return e;
  }

  cloneMonomerStructureToPosition(
    s: Struct,
    g: SGroup,
    c: Vec2,
    p: Vec2 | null,
    e: boolean,
  ): SGroup | undefined {
    const sa = SGroup.getAtoms(s, g);
    const sc = this.getAtomsCenter(s, sa);
    if (!sc) return;
    const rep = s.clone(
      new Pile<number>(sa),
      new Pile<number>(SGroup.getBonds(s, g)),
      true,
      undefined,
      new Pile<number>(),
      new Pile<number>(),
      new Pile<number>(),
      new Pile<number>(),
      new Pile<number>(),
      undefined,
      true,
    );
    const sh = c.sub(sc);
    rep.atoms.forEach((a) => {
      if (a.pp) a.pp = a.pp.add(sh);
    });
    rep.sgroups.forEach((rg) => {
      this.setMonomerExpandedState(rg, e);
      if (p) rg.pp = p;
      else if (rg.pp) rg.pp = rg.pp.add(sh);
    });
    const m = new Map<number, number>();
    rep.mergeInto(
      s,
      undefined,
      undefined,
      true,
      undefined,
      m,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true,
    );
    const nids = new Set(m.values());
    let out: SGroup | undefined;
    s.sgroups.forEach((sg) => {
      if (!out && sg.isMonomer && sg.atoms.every((id) => nids.has(id)))
        out = sg;
    });
    return out;
  }

  reconnectMonomerExternalBonds(s: Struct, g: SGroup, b: ExtBond[]): void {
    const aps = g.getAttachmentPoints();
    b.forEach(({ bond, targetEndpoint, attachmentPointNumber }) => {
      if (!isNumber(attachmentPointNumber)) return;
      const ap = aps.find(
        (p) => p.attachmentPointNumber === attachmentPointNumber,
      );
      if (!ap) return;
      if (targetEndpoint === 'begin') {
        bond.begin = ap.atomId;
        bond.beginSuperatomAttachmentPointNumber = attachmentPointNumber;
      } else {
        bond.end = ap.atomId;
        bond.endSuperatomAttachmentPointNumber = attachmentPointNumber;
      }
      const opp = targetEndpoint === 'begin' ? 'end' : 'begin';
      const oid = opp === 'begin' ? bond.begin : bond.end;
      const og = s.getGroupFromAtomId(oid);
      if (og?.isMonomer && og !== g)
        this.updateBondEndpointByAttachmentPoint(bond, opp, og);
      s.bonds.add(bond);
    });
  }

  replaceMatchingMonomerStructures(
    s: Struct,
    m: BaseMonomer,
    t: KetMonomerClass,
    sym: string,
    e: boolean,
    ids?: number[],
  ): void {
    let sg: SGroup | undefined;
    s.sgroups.forEach((g) => {
      if ((g as EditableSGroup).monomer === m) sg = g;
    });
    if (!sg) return;
    const src = sg;
    this.setMonomerExpandedState(src, e);
    const restrict = ids && ids.length > 1 ? new Set(ids) : null;
    Array.from(s.sgroups.entries()).forEach(([id, g]) => {
      const gm = g as EditableSGroup;
      const { props, label } = gm.monomer?.monomerItem ?? {};
      const sbl = props?.MonomerCode ?? label;
      if (g === src || !g.isMonomer || props?.MonomerClass !== t || sbl !== sym)
        return;
      if (restrict && !restrict.has(id)) return;
      const ta = SGroup.getAtoms(s, g);
      const tc = this.getAtomsCenter(s, ta);
      if (!tc) return;
      const eb = this.getMonomerExternalBonds(s, g);
      const tp = g.pp ? new Vec2(g.pp) : null;
      const te = g.isExpanded();
      this.deleteMonomerStructure(s, g);
      const rep = this.cloneMonomerStructureToPosition(s, src, tc, tp, te);
      if (!rep) return;
      this.reconnectMonomerExternalBonds(s, rep, eb);
      (rep as EditableSGroup).monomer = this.cloneMonomer(m);
      rep.data.name = m.monomerItem.props.MonomerName;
      this.setMonomerExpandedState(rep, te);
    });
  }
}
