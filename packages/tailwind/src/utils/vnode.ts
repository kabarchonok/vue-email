import { cloneVNode, h, isVNode, VNode, VNodeNormalizedChildren, } from "vue";

interface VNodeInternal extends VNode {
  dynamicChildren?: VNode[] | null; // Internal VNode property
}

type Callback = (vNode: VNode) => Promise<{ extraProps: Parameters<typeof cloneVNode>[1], extraClasses: string[] }>

// TODO: move tailwind to component and use as callback
async function walkVNode(
  vNode: VNode,
  callback: Callback ,
): Promise<VNode> {
  if (!vNode.props || !vNode.props.class) {
    return vNode;
  }

  const { extraProps, extraClasses } = await callback(vNode)
  const cloned = cloneVNode(vNode, extraProps) as VNodeInternal;

  if (cloned.props && cloned.props.class) {
    cloned.props.class = cloned.props.class
      .split(" ")
      .filter((item: string) => {
        return !extraClasses.includes(item);
      })
      .join(" ");

    if (!cloned.props.class.trim()) {
      delete cloned.props.class;
    }
  }

  if (cloned.children) {
    if (Array.isArray(cloned.children)) {
      cloned.children = await Promise.all(
        cloned.children.map((child) =>
          isVNode(child) ? walkVNode(child, callback) : child,
        ),
      );
    } else if (isVNode(cloned.children)) {
      cloned.children = (await walkVNode(
        cloned.children,
        callback,
      )) as unknown as VNodeNormalizedChildren;
    }
  }

  if (cloned.dynamicChildren) {
    cloned.dynamicChildren = await Promise.all(
      cloned.dynamicChildren.map((child) => walkVNode(child, callback)),
    );
  }

  return cloned;
}

export async function walkVNodeTree(vNodes: VNodeNormalizedChildren, callback: Callback): Promise<VNode[]> {
  if (!vNodes) return []

  const nodes = Array.isArray(vNodes) ? vNodes : [vNodes]

  return Promise.all(
    nodes.map(node => {
      if (!isVNode(node)) {
        return h('span', {}, typeof node === 'string' || typeof node === 'number' ? String(node) : '')
      }

      return walkVNode(node, callback)
    })
  )
}
