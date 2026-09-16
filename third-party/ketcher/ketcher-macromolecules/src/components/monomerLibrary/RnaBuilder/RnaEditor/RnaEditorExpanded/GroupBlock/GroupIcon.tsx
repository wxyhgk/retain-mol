import { GroupIcon as StyledGroupIcon, GroupIconContainer } from './styles';
import { memo } from 'react';
import type { MacromoleculesIconName } from 'src/uiBridge';

type Props = {
  name: MacromoleculesIconName;
  selected: boolean | undefined;
  empty: boolean;
};

const GroupIcon = ({ selected, empty, name }: Props) => {
  return (
    <GroupIconContainer>
      <StyledGroupIcon selected={selected} empty={empty} name={name} />
    </GroupIconContainer>
  );
};

export default memo(GroupIcon);
