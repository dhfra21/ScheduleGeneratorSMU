import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi'; // ✅ Import mdi icons

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi', // ✅ Set mdi as the default icon set
    aliases,
    sets: { mdi },
  },
});
