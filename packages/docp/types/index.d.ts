import type { Configuration } from "webpack";
interface MarkedOption {
  breaks?: boolean;
  gfm?: boolean;
  renderer?: Record<string, unknown>;
}

type Href = {
  href?: string,
  target?: string
  value: string
}
type DocStruct = {
  logo?: string,
  name: string,
  navbar?: Array<Href>,
  sidebar?: string,
  content: string
}
