export const basicAtoms = ['H', 'C', 'N', 'O', 'S', 'P', 'F', 'Cl', 'Br', 'I'];

export const atomCuts = {
  // ChemDraw Atom hotkeys - single atom labels (second row b/B/h/H etc.)
  Br: 'b',
  BH2: 'Shift+b',
  H: 'h',
  Cbz: 'Shift+h',
  Boc: 'y',
  Fmoc: 'Shift+q',
  Me: 'm',
  MgBr: 'Shift+m',
  CH3: 'c',
  I: 'i',
  D: 'd',
  Ac: 'Shift+a',
  Et: 'e',
  CO2Me: 'Shift+e',
  OH: 'o',
  OMe: 'Shift+o',
  NH2: 'n',
  NO2: 'Shift+n',
  SH: 's',
  SiH3: 'Shift+s',
  PH2: 'p',
  Ph: 'Shift+p',
  F: 'f',
  CF3: 'Shift+f',
  Cl: 'l',
  Li: 'Shift+l',
  // First row sprout 0-9 etc. handled via handleHotkeysOverItem sprout, keep minimal for label
  '*': 'Shift+8',
};

export default Object.keys(atomCuts).reduce((res, label) => {
  res[`atom-${label.toLowerCase()}`] = {
    title: `Atom ${label}`,
    shortcut: atomCuts[label],
    action: {
      tool: 'atom',
      opts: { label },
    },
  };
  return res;
}, {});
