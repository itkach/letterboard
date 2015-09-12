
function createNameSpace(namespace) {

  function fqn(name) {
    return namespace + '.' + name;
  }

  function set(name, value) {
    localStorage.setItem(fqn(name), JSON.stringify(value));
  }

  function get(name, defaultValue) {
    const fullName = fqn(name);
    if (!localStorage.hasOwnProperty(fullName)) {
      return defaultValue;
    }
    const value = localStorage.getItem(fullName);
    return JSON.parse(value);
  }

  function remove(name) {
    localStorage.removeItem(fqn(name));
  }

  const result = function(subNameSpace) {
    return createNameSpace(namespace + '.' + subNameSpace);
  };

  result.set = set;
  result.get = get;
  result.remove = remove;

  return result;
}

export default createNameSpace;
