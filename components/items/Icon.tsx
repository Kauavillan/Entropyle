import type { IconType } from "react-icons";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as AiIcons from "react-icons/ai";
import * as BiIcons from "react-icons/bi";
import * as GiIcons from "react-icons/gi";
import * as FiIcons from "react-icons/fi";
import * as RiIcons from "react-icons/ri";
import * as HiIcons from "react-icons/hi";
import * as SiIcons from "react-icons/si";
import * as IoIcons from "react-icons/io";
import * as CgIcons from "react-icons/cg";

const ICON_SETS = {
  fa: FaIcons,
  md: MdIcons,
  ai: AiIcons,
  bi: BiIcons,
  gi: GiIcons,
  fi: FiIcons,
  ri: RiIcons,
  hi: HiIcons,
  si: SiIcons,
  io: IoIcons,
  cg: CgIcons,
} as const;

type IconSets = typeof ICON_SETS;
export type Provider = keyof IconSets;
export type IconName<P extends Provider> = Extract<keyof IconSets[P], string>;

type BaseProps = {
  size?: number | string;
  className?: string;
  title?: string;
  ariaHidden?: boolean;
};

type ByComponent = {
  /** Pass an imported icon component directly */
  icon: IconType;
} & BaseProps;

type ByName<P extends Provider> = {
  /** Provider short name, e.g. 'fa', 'md', 'ai' */
  provider: P;
  /** Exact export name from the provider, e.g. 'FaBeer' */
  name: IconName<P>;
} & BaseProps;

/**
 * Generic Icon component.
 * - Use `icon={ImportedIcon}` to pass an imported icon component.
 * - Or use `provider="fa" name="FaBeer"` to pick by provider+name (autocomplete available).
 */
export function Icon<P extends Provider = Provider>(
  props: ByComponent | ByName<P>,
) {
  if ("icon" in props) {
    const {
      icon: Comp,
      size,
      className,
      title,
      ariaHidden,
    } = props as ByComponent;
    return (
      <Comp
        size={size}
        className={className}
        title={title}
        aria-hidden={ariaHidden}
      />
    );
  }

  const { provider, name, size, className, title, ariaHidden } =
    props as ByName<P>;
  const set = ICON_SETS[provider];
  const Comp = (set as Record<string, IconType>)[name] as IconType | undefined;
  if (!Comp) return null;
  return (
    <Comp
      size={size}
      className={className}
      title={title}
      aria-hidden={ariaHidden}
    />
  );
}

export default Icon;
