export interface Annotation {
  id: string;
  modelId: string;
  [key: string]: any; // Allow additional fields
}

export interface AnnotationData {
  [key: string]: any; // Data used to create or update an annotation
}