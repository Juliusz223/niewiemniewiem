class PlayerCounter {
    constructor({ ip, element, format, refreshRate }) {
      format = format || '{online}';
      refreshRate = refreshRate || 60 * 1000;
  
      if (!ip) {
        throw TypeError('ip cannot be null or undefined');
      }
  
      if (!element) {
        throw TypeError('element cannot be null or undefined');
      }
  
      const ipAddress = ip.split(':');
      this.ip = ipAddress[0];
      this.port = ipAddress[1] || '25565';
  
      this.format = format;
      this.element = typeof element === 'string'
        ? document.querySelector(element)
        : element;
  
      this.runQuery();
      this.timerId = setInterval(this.runQuery.bind(this), refreshRate);
    }
  
    runQuery() {
      const request = new XMLHttpRequest();
      request.onreadystatechange = () => {
        if (request.readyState !== 4 || request.status !== 200) return;
  
        const FORMAT_REGEX = /{\b(online|max)\b}/ig;
        const response = JSON.parse(request.responseText);
        const displayStatus = this.element.getAttribute('data-playercounter-status');
  
        if (displayStatus !== null) {
          this.element.innerText = response.online ? 'online' : 'offline';
          return;
        }
  
        if (response.online) {
          const online = response.players ? response.players.online : 0;
          const max = response.players ? response.players.max : '?';

          this.element.innerHTML = this.format.replace(FORMAT_REGEX, (match, group) => {
            if (group === 'online') return online;
            if (group === 'max') return max;
            return match;
          });
        }
      };
  
      request.open('GET', `https://api.mcsrvstat.us/2/${this.ip}:${this.port}`);
      request.send();
    }
}
  
const onDomLoad = function() {
    const elements = document.querySelectorAll('[data-playercounter-ip]');
  
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
  
      new PlayerCounter({
        element: element,
        ip: element.getAttribute('data-playercounter-ip'),
        format: element.getAttribute('data-playercounter-format'),
        refreshRate: element.getAttribute('data-playercounter-refreshRate')
      });
    }
};
  
if (document.readyState === 'complete') {
    onDomLoad();
} else {
    window.onload = onDomLoad;
}
  
window.PlayerCounter = PlayerCounter;
