import { BackendModule, InitOptions, ReadCallback } from "i18next";
import yaml from 'js-yaml';

export interface DynamicLoaderOptions {
  loadPath?: string; // Template like "/locales/{{lng}}/{{ns}}.yaml"
  parse?: (data: string) => any;
}

export default class DynamicLoaderBackend implements BackendModule<DynamicLoaderOptions> {
  static type = 'backend' as const;

  type = 'backend' as const;
  init(services: any, backendOptions: DynamicLoaderOptions = {}, i18nextOptions: InitOptions): void {
    console.log("options:", this.options)
    this.options = backendOptions;
    const localFile = require("../config/locales/de.yaml");
  }

  options: DynamicLoaderOptions = {};

  read(language: string, namespace: string, callback: ReadCallback): void {
    this.readMulti([language], [namespace], (err, data) => {
      if (err) {
        callback(err, false);
      } else {
        callback(null, data);
      }
    });
  }

  // Optional for multi-read
  readMulti(languages: string[], namespaces: string[], callback: (err: any, data: any) => void): void {
    const loadPath = this.interpolate(this.options.loadPath || '/locales/{{lng}}.yaml', {
      lng: languages[0],
      ns: namespaces[0],
    });
    console.log("reading backend", languages, namespaces, loadPath, "options:", this.options)

    const fallback_parse =  (data: string) => {error: "unable to load"};
    const parse: (data: string) => any = this.options.parse || fallback_parse;

    
  }

  // Optional: Used by i18next for template vars
  interpolate(str: string, vars: { [key: string]: string }) {
    return str.replace(/{{(.*?)}}/g, (_, k) => vars[k.trim()] || '');
  }
}