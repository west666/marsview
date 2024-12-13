import { ComponentType, IDragTargetItem } from '@/packages/types';
import { useDrop } from 'react-dnd';
import { getComponent } from '@/packages/index';
import { Material } from '@/packages/MarsRender/MarsRender';
import { usePageStore } from '@/stores/pageStore';
import { forwardRef, useImperativeHandle, useState } from 'react';
import React from 'react';
import styles from './index.module.less';
/*泛型只需要定义组件本身用到的属性*/
export interface IConfig {
  text: string;
}
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MSpace = ({ id, type, config, elements }: ComponentType, ref: any) => {
  const addChildElements = usePageStore((state) => state.addChildElements);
  const [visible, setVisible] = useState(true);
  // 拖拽接收
  const [, drop] = useDrop({
    accept: 'MENU_ITEM',
    async drop(item: IDragTargetItem, monitor) {
      if (monitor.didDrop()) return;
      // 生成默认配置
      const { config, events, methods = [] }: any = (await getComponent(item.type + 'Config'))?.default || {};
      addChildElements({
        type: item.type,
        name: item.name,
        parentId: id,
        id: item.id,
        config,
        events,
        methods,
      });
    },
    // TODO: 拖拽组件时，容器呈现背景色（后期需要判断组件是否可以拖入）
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // 对外暴露方法
  useImperativeHandle(ref, () => {
    return {
      show() {
        setVisible(true);
      },
      hide() {
        setVisible(false);
      },
    };
  });
  const { xGap, yGap, xRate, yRate } = config.props;
  const gridStyles = {
    gridTemplateColumns: yRate,
    gridTemplateRows: xRate,
    rowGap: yGap,
    columnGap: xGap,
    overflow: 'scroll',
    height: '100%',
    width: '100%',
  };
  return (
    visible && (
      <div style={{ ...config.style, ...gridStyles }} data-id={id} data-type={type} ref={drop} className={styles.gridWrapper}>
        {elements?.length ? (
          elements?.map((child) => <Material key={child.id} item={child} />)
        ) : (
          <div className="slots" style={{ width: '100%', height: '100%', lineHeight: '100px' }}>
            拖拽组件到这里
          </div>
        )}
      </div>
    )
  );
};
export default forwardRef(MSpace);