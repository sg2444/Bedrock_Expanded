export class DynamicType {
  constructor(dType) {
    this.dType = dType;
  }
//test
  static typeClasses = new Map();

  /**
   * Registers a subclass implementation for a given entity identifier.
   * All non-constructor methods will be dynamically delegated.
   */
  static register(typeClass) {
    const id = typeClass.identifier;
    this.typeClasses.set(id, typeClass);

    const proto = typeClass.prototype;
    const methodNames = Object.getOwnPropertyNames(proto).filter(
      name => name !== "constructor" && typeof proto[name] === "function"
    );

    for (const method of methodNames) {
      if (!(method in DynamicType.prototype)) {
        DynamicType.prototype[method] = function (...args) {
          const Class = DynamicType.typeClasses.get(this.getTypeId());
          const impl = Class?.prototype[method];
          if (typeof impl === "function") {
            return impl.apply(this, args);
          }
        };
      }
    }
  }

  getTypeId() {
    return this.dType?.typeId ?? "";
  }

  isValid() {
    return this.dType?.isValid?.() ?? false;
  }

  getNameTag() {
    return this.dType?.nameTag ?? "(unnamed)";
  }

  getComponentSafe(name) {
    try {
      return this.dType?.getComponent(name);
    } catch {
      return undefined;
    }
  }

  runCommand(command) {
    try {
      return this.dType?.runCommandAsync?.(command);
    } catch {
      return null;
    }
  }
}
