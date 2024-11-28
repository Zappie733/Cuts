export interface IDocumentProps {
  documentId?: string;
  name: string;
  file: string;
  path?: string;
}

export interface ISelectDocumentProps {
  handleSetDocument: (documents: IDocumentProps[]) => void;
}
