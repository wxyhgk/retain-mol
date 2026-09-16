/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { type RefObject, useRef } from 'react';
import {
  type ToolbarGroupItemCallProps,
  type ToolbarGroupItemProps,
  ToolbarGroupItem,
} from '../ToolbarGroupItem';
import type { ToolbarItem, ToolbarItemVariant } from '../toolbar.types';
import { selectOptions } from './leftToolbarOptions';

import { ArrowScroll } from '../ArrowScroll';
import classes from './LeftToolbar.module.less';
import clsx from 'clsx';
import { useInView } from 'react-intersection-observer';
import { useResizeObserver } from '../../../hooks';

interface LeftToolbarProps
  extends Omit<ToolbarGroupItemProps, 'id' | 'options'> {
  className?: string;
}

type LeftToolbarCallProps = ToolbarGroupItemCallProps;

type Props = LeftToolbarProps & LeftToolbarCallProps;

type ItemProps = {
  id: ToolbarItemVariant;
  options?: ToolbarItem[];
  dataTestId?: string;
};

interface GroupProps {
  items?: ItemProps[];
  className?: string;
  rest: Omit<Props, 'className'>;
}

const Group = ({ items, className, rest }: GroupProps) => {
  const { status } = rest;
  const visibleItems = (items ?? []).filter(
    (item) =>
      !status[item.id]?.hidden &&
      !(item.options?.length
        ? item.options.every((option) => status[option.id]?.hidden)
        : false),
  );
  if (!visibleItems.length) return null;
  return (
    <div className={clsx(classes.group, className)}>
      {visibleItems.map((item) => (
        <ToolbarGroupItem
          id={item.id}
          options={item.options}
          key={item.id}
          {...(item.id === 'bonds' ? { dataTestId: 'bonds' } : {})}
          {...rest}
        />
      ))}
    </div>
  );
};

const LeftToolbar = (props: Props) => {
  const { className, ...rest } = props;
  const { ref, height } = useResizeObserver<HTMLDivElement>();
  const scrollRef = useRef(null) as RefObject<HTMLDivElement | null>;
  const [startRef, startInView] = useInView({ threshold: 1 });
  const [endRef, endInView] = useInView({ threshold: 1 });
  const sizeRef = useRef(null) as RefObject<HTMLDivElement | null>;

  const scrollUp = () => {
    if (!scrollRef.current || !sizeRef.current) {
      return;
    }

    scrollRef.current.scrollTop -= sizeRef.current.offsetHeight;
  };

  const scrollDown = () => {
    if (!scrollRef.current || !sizeRef.current) {
      return;
    }

    scrollRef.current.scrollTop += sizeRef.current.offsetHeight;
  };

  return (
    <div
      data-testid="left-toolbar"
      className={clsx(classes.root, className)}
      ref={ref}
    >
      <div
        className={classes.buttons}
        ref={scrollRef}
        data-testid="left-toolbar-buttons"
      >
        <div className={classes.listener} ref={startRef}>
          <Group
            className={classes.groupItem}
            items={[
              { id: 'hand' },
              { id: 'select', options: selectOptions },
              { id: 'erase' },
            ]}
            rest={rest}
          />
        </div>

        {/* ChemDraw mimic: single-bond dropdown expanded - each bond as separate cell, missing slots as placeholder */}
        <Group
          className={classes.groupItem}
          items={[
            { id: 'bond-single' },
            { id: 'bond-double' },
            { id: 'bond-triple' },
            { id: 'bond-up' },
            { id: 'bond-down' },
            { id: 'bond-updown' },
            { id: 'bond-crossed' },
            { id: 'chain' },
            { id: 'charge-plus' },
            { id: 'charge-minus' },
          ]}
          rest={rest}
        />
        <div className={classes.listener} ref={sizeRef}>
          <Group
            className={classes.groupItem}
            items={[{ id: 'text' }]}
            rest={rest}
          />
        </div>

        <div ref={endRef}>
          <Group className={classes.groupItem} items={[]} rest={rest} />
        </div>
      </div>
      {height && (scrollRef?.current?.scrollHeight || 0) > height && (
        <ArrowScroll
          startInView={startInView}
          endInView={endInView}
          scrollForward={scrollDown}
          scrollBack={scrollUp}
        />
      )}
    </div>
  );
};

export type { LeftToolbarProps, LeftToolbarCallProps };
export { LeftToolbar };
