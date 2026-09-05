import type { LegalDoc } from './legal';

/**
 * Versión en español de los documentos legales de ROUNDS.
 *
 * ESTO ES UN BORRADOR PARA EL ABOGADO, NO ES ASESORAMIENTO JURÍDICO. No se
 * publica sin una revisión.
 *
 * La versión en inglés (`legal.ts`) es la única que da fe. Esta traducción
 * existe para que cada persona pueda leer sus propias condiciones en su idioma;
 * si hay alguna discrepancia, prevalece el inglés, y cada documento lo dice en
 * la primera línea (ver `PREVAILS` en `legal.ts`).
 *
 * Las marcas [DRAFT — …] sobreviven a la traducción: una cláusula que el
 * abogado no ha cerrado no está cerrada en ningún idioma. La palabra «DRAFT»
 * se queda en inglés — es la marca literal que la app busca para mostrar el
 * aviso de borrador (ver `app/legal/[doc].tsx`).
 *
 * Los títulos de las secciones, su orden y la fecha de actualización son
 * idénticos a los del inglés. No se ha cambiado, reformateado ni localizado
 * ninguna cifra, ninguna edad, ningún plazo y, sobre todo, ningún número de
 * teléfono.
 */

const UPDATED = 'September 2026';

export const ES: Record<string, LegalDoc> = {
  terms: {
    title: 'Términos del servicio',
    updated: UPDATED,
    sections: [
      {
        heading: 'Qué es ROUNDS',
        body: 'ROUNDS es un acompañante para salir de noche. Registra lo que le cuentas, estima tu ritmo de bebida, te ayuda a mantener a tu grupo junto y te ayuda a volver a casa. No es un producto sanitario, no es un alcoholímetro y no es una fuente de consejo sobre si estás en condiciones de conducir o de manejar nada.',
      },
      {
        heading: 'La estimación del ritmo — lee esta',
        body: 'Cualquier cifra de alcohol en sangre que ROUNDS muestre es una ESTIMACIÓN calculada a partir de lo que has apuntado, de tus datos corporales básicos y de medias de población. No puede tener en cuenta la comida, la medicación, una enfermedad, el metabolismo individual, la graduación de lo que de verdad te sirvieron ni una copa que se te olvidó apuntar. Puede equivocarse en cualquiera de los dos sentidos, y a menudo lo hace. No la uses nunca para decidir si conducir, y no te fíes nunca de ella para decidir si tú o cualquier otra persona estáis seguros. Si has bebido, no conduzcas.',
      },
      {
        heading: 'Las funciones de seguridad no son un servicio de seguridad',
        body: 'El aviso de llegada a casa envía un mensaje a los contactos que elegiste, si no das el aviso. Es una comodidad, no un servicio de emergencia. Depende de tu teléfono, de tu batería, de tu cobertura y de que se pueda localizar a tus contactos, y cualquiera de esas cosas puede fallar. No contacta con los servicios de emergencia y no lo vigila nadie. En una emergencia llama al 112 (UE/Reino Unido), al 911 (EE. UU.) o a tu número local.',
      },
      {
        heading: 'Edad',
        body: 'ROUNDS es para adultos con la edad legal para beber en su región — 18 en la UE, el Reino Unido y Rumanía, 21 en Estados Unidos. Verificamos la fecha de nacimiento al registrarte y guardamos el resultado en nuestros servidores, así que reinstalar la app no lo reinicia. Facilitar una fecha de nacimiento falsa es un incumplimiento de estos términos y cerraremos la cuenta.',
      },
      {
        heading: 'Tu cuenta y tu conducta',
        body: 'Eres responsable de lo que publicas en las noches compartidas y en los chats de peña. El acoso, la suplantación de identidad, el contenido que sexualiza a menores y cualquier cosa que ponga en peligro a una persona están prohibidos y acabarán con la cuenta. Puedes bloquear y denunciar a cualquiera desde su perfil; las denuncias las revisa una persona, normalmente en 24 horas. Puedes borrar tu cuenta cuando quieras desde Ajustes › Datos y cuenta.',
      },
      {
        heading: 'Lo que podemos hacer',
        body: 'Podemos suspender o cerrar una cuenta que incumpla estos términos, y podemos retirar el contenido que los incumpla. Te diremos por qué, salvo que hacerlo pusiera a alguien en riesgo o incumpliera una obligación legal. Podemos cambiar estos términos; los cambios sustanciales se notifican en la app al menos 30 días antes de que surtan efecto, y seguir usando ROUNDS después de eso es aceptación.',
      },
      {
        heading: 'Pagos',
        body: 'ROUNDS es gratuito por ahora y no ofrece nada a la venta. No hay suscripción, no hay compras dentro de la app y no hay ningún precio en ninguna parte de la app. Las funciones de seguridad son gratuitas para siempre y nunca se pondrán detrás de un pago de ningún tipo. [DRAFT — esta cláusula está escrita para la app TAL Y COMO SE PUBLICA. Si se introduce un nivel de pago, sustituir esta sección por las condiciones de suscripción de la nota de redacción de abajo en lugar de modificar esta, y dar el preaviso de 30 días que exige «Cambios en estos términos».] [DRAFT — condiciones de suscripción que hay que reponer cuando se lance la facturación: renovación automática hasta su cancelación; cancelación y reembolsos gestionados por la App Store o Google Play conforme a sus propias políticas y no por nosotros; el derecho legal de desistimiento de 14 días en la UE y el Reino Unido y cómo se ejerce a través de la tienda; y la confirmación de que la seguridad queda fuera de cualquier nivel de pago.]',
      },
      {
        heading: 'Nuestra propiedad intelectual, y la tuya',
        body: 'El nombre ROUNDS, la app, su interfaz, sus ilustraciones y sus dibujos de copas son nuestros y se te licencian para un uso personal y no comercial de la app. Tú conservas todo lo que escribes y subes. Al publicar contenido en una noche compartida o en una peña nos das una licencia para almacenarlo y mostrarlo a las personas con las que lo compartiste, mientras lo mantengas ahí y no más. [DRAFT — el abogado debe fijar la redacción de la licencia, confirmar si hace falta una licencia más amplia para cualquier uso promocional (preferiríamos que no) y comprobar la situación de la marca «ROUNDS» en cada mercado de lanzamiento.]',
      },
      {
        heading: 'Responsabilidad',
        body: 'ROUNDS se ofrece tal cual y según disponibilidad. En la máxima medida que permita la ley, excluimos las garantías implícitas y no respondemos de los daños indirectos o consecuentes, del lucro cesante ni de la pérdida de datos. Nuestra responsabilidad total frente a ti por todas las reclamaciones en cualquier periodo de doce meses está limitada a [DRAFT — límite que debe fijar el abogado: el importe que nos hayas pagado en ese periodo, o un suelo fijo para un usuario gratuito, o ambos, lo que corresponda en cada mercado]. Nada en estos términos limita ni excluye la responsabilidad por muerte o daños personales causados por negligencia, por fraude o declaración fraudulenta, ni por nada más que no pueda limitarse legalmente. Si eres consumidor, tus derechos legales no se ven afectados y nada de aquí los desplaza. [DRAFT — el abogado debe confirmar que la lista de exclusiones resiste la UK Consumer Rights Act 2015 y la directiva europea sobre cláusulas abusivas (EU Unfair Terms Directive) en cada mercado de lanzamiento, y aconsejar si hace falta una cláusula aparte para usuarios profesionales.]',
      },
      {
        heading: 'Ley y litigios',
        body: 'Antes de nada formal, escribe a hello@rounds.app; casi todo se resuelve así y responderemos en [DRAFT — plazo de respuesta, lo fija el abogado]. Estos términos se rigen por la ley de [DRAFT — ley aplicable, la fija el abogado], y los tribunales de [DRAFT — fuero, lo fija el abogado] tienen jurisdicción. Si eres consumidor residente en la UE o en el Reino Unido, esto no te priva de la protección de las normas imperativas de tu propio país, y puedes acudir a tus propios tribunales. Los consumidores de la UE también pueden usar la plataforma de resolución de litigios en línea de la Comisión Europea en ec.europa.eu/consumers/odr. [DRAFT — el abogado debe fijar la ley aplicable y el fuero por mercado de lanzamiento, confirmar que el enlace de ODR sigue siendo obligatorio y está vigente en el momento de la publicación, y aconsejar si una cláusula de arbitraje y una renuncia a las acciones colectivas son adecuadas para Estados Unidos y ejecutables dada la posición del consumidor en los demás mercados.]',
      },
      {
        heading: 'Cambios en estos términos',
        body: 'Podemos cambiar estos términos. Los cambios sustanciales se notifican en la app al menos 30 días antes de que surtan efecto, y seguir usando ROUNDS después de esa fecha es aceptación. Si no aceptas un cambio, puedes borrar tu cuenta desde Ajustes › Datos y cuenta y tus datos se eliminan conforme a la política de abajo.',
      },
      {
        heading: 'Contacto',
        body: 'ROUNDS lo opera [DRAFT — denominación social completa y domicilio social, que deben coincidir exactamente con la Política de privacidad y con las fichas de las dos tiendas]. Escribe a hello@rounds.app para lo que sea, o a privacy@rounds.app sobre tus datos; contestamos a la dirección desde la que escribes. Las denuncias por acoso o por cualquier cosa que ponga en riesgo a una persona las revisa una persona, normalmente en 24 horas, y también puedes denunciar desde cualquier perfil dentro de la app.',
      },
    ],
  },

  privacy: {
    title: 'Política de privacidad',
    updated: UPDATED,
    sections: [
      {
        heading: 'Quiénes somos',
        body: 'El responsable del tratamiento de los datos personales descritos en esta política es [DRAFT — denominación social completa], una [DRAFT — forma societaria, p. ej. SRL] inscrita en [DRAFT — país de inscripción] con el número [DRAFT — número de registro mercantil], en [DRAFT — domicilio social]. Puedes localizarnos en privacy@rounds.app. [DRAFT — el abogado debe confirmar si hace falta un delegado de protección de datos conforme al Artículo 37 y, en su caso, añadir aquí sus datos de contacto; y si hacen falta un representante en la UE conforme al Artículo 27 y un representante en el Reino Unido, añadiendo cada uno con una dirección postal. Estos mismos datos deben coincidir con las fichas de las tiendas y con los Términos.]',
      },
      {
        heading: 'La versión corta',
        body: 'Guardamos lo que apuntas para que la app pueda devolvértelo. La estimación de alcohol en sangre se calcula en tu teléfono y no se envía nunca a ninguna parte. Tus amigos pueden ver que has salido, nunca qué has bebido. No vendemos tus datos, no los compartimos para publicidad y en ROUNDS no hay publicidad. Puedes exportarlo todo o borrar tu cuenta desde Ajustes › Datos y cuenta, al momento y sin pedírnoslo.',
      },
      {
        heading: 'Qué guardamos, y por qué',
        body: 'Tu perfil (nombre visible, nombre de usuario, avatar) para que tus amigos puedan encontrarte — necesario para ejecutar el contrato. Lo que apuntas, tus noches, tus planes y tus ajustes — necesarios para prestar el servicio. Los datos corporales básicos (sexo y peso), solo si los das, y solo para calcular la estimación del ritmo en tu dispositivo — son datos relativos a la salud y los tratamos únicamente sobre la base de tu consentimiento explícito, que puedes retirar borrando esos campos. La fecha de nacimiento, para verificar la edad legal para beber — una obligación legal. Eventos de diagnóstico, que llevan recuentos y categorías y nunca el nombre de una copa, de un sitio o de una persona.',
      },
      {
        heading: 'Lo que nunca sale de tu teléfono',
        body: 'La estimación de alcohol en sangre se calcula en tu dispositivo y no se guarda nunca en nuestros servidores ni se transmite a ninguna parte. El emparejamiento de contactos aplica un hash a los números de teléfono en tu dispositivo con una sal criptográfica; solo se envían los hashes, y no conservamos tu lista de contactos. Tu dirección de casa, que se usa para rellenar de antemano un viaje de vuelta, se guarda solo en el dispositivo.',
      },
      {
        heading: 'Ubicación',
        body: 'La ubicación se usa para mostrar sitios cerca de ti y no se guarda en nuestros servidores para eso. Compartir tu ubicación en directo con una noche se activa noche por noche, solo lo ve la gente de esa noche y se borra automáticamente cuando la noche termina — la fila se elimina, no solo se oculta. Nunca pedimos la ubicación en segundo plano.',
      },
      {
        heading: 'Quién más lo ve',
        body: 'Nada sobre lo que bebes se comparte con nadie a menos que lo compartas tú. Un amigo puede ver que has salido y en qué sitios, solo si pones una noche como visible para amigos. Un amigo nunca ve qué has bebido, cuánto, tu ritmo, tus rachas ni tu gasto. No vendemos datos personales, no los compartimos para publicidad y en ROUNDS no hay publicidad.',
      },
      {
        heading: 'Bases legales',
        body: 'Contrato: tu perfil, tus registros, tus noches, tus planes y tus ajustes — no podemos prestar la app sin ellos. Consentimiento explícito (Artículo 9(2)(a)): tu sexo y tu peso, que son datos relativos a la salud y se usan solo para calcular la estimación del ritmo en tu dispositivo; lo retiras borrando esos campos, lo que detiene la estimación y nada más. Obligación legal: tu fecha de nacimiento, para verificar la edad legal para beber. Intereses legítimos: mantener el servicio seguro, prevenir abusos y los eventos de diagnóstico que solo llevan recuentos y categorías — puedes oponerte a estos últimos en Ajustes › Privacidad. [DRAFT — el abogado debe confirmar la base del Artículo 9 para los datos corporales y si una evaluación de intereses legítimos debería documentarse y resumirse aquí.]',
      },
      {
        heading: 'Subencargados',
        body: 'Supabase — base de datos, autenticación y almacenamiento de archivos, alojados en la UE. Expo — envío de notificaciones push. [DRAFT — nombre del proveedor de SMS], usado solo para enviar un escalado de llegada a casa a los contactos que elegiste. [DRAFT — el abogado debe completar esta lista antes del lanzamiento y, para cada entrada, dejar constancia de: la denominación social del encargado, qué trata, dónde lo trata y el mecanismo de transferencia para todo lo que salga del EEE o del Reino Unido (cláusulas contractuales tipo más una evaluación de impacto de la transferencia, o una decisión de adecuación). El abogado debe aconsejar sobre publicar esta lista en rounds.app/subprocessors con el compromiso de avisar antes de añadir un nuevo encargado, que es la forma que esperan los revisores de empresa y las tiendas.]',
      },
      {
        heading: 'Cómo los protegemos',
        body: 'Los datos se cifran en tránsito y en reposo. El acceso a tus filas lo impone la propia base de datos y no la app, así que un fallo en el cliente no puede enseñar tus datos a otra persona. Nadie en ROUNDS lee tus registros. [DRAFT — el abogado debe confirmar la redacción sobre notificación de brechas que exigen los Artículos 33 y 34, y si debería aparecer aquí un compromiso concreto sobre el plazo de notificación.]',
      },
      {
        heading: 'Sin elaboración de perfiles, sin decisiones automatizadas',
        body: 'Nada en ROUNDS toma una decisión sobre ti con efectos jurídicos o de efecto similarmente significativo, y no elaboramos perfiles tuyos para publicidad. La estimación del ritmo y los mensajes de bienestar se calculan en tu propio dispositivo a partir de lo que has apuntado, y son información para ti, no un juicio registrado sobre ti.',
      },
      {
        heading: 'Cuánto tiempo los guardamos',
        body: 'Tus registros y tus noches se guardan hasta que los borras o borras tu cuenta. Borrar tu cuenta abre un periodo de gracia de 30 días, tras el cual todo se elimina mediante una cascada en el servidor; se te cierra la sesión al momento. La ubicación en directo caduca en unas horas. Los eventos de diagnóstico se guardan 12 meses. Las denuncias de moderación se guardan 24 meses para poder reconocer conductas repetidas.',
      },
      {
        heading: 'Tus derechos',
        body: 'Conforme al RGPD y al UK GDPR puedes acceder a tus datos, rectificarlos, suprimirlos, limitar su tratamiento, oponerte y portarlos. Expórtalo todo en JSON desde Ajustes › Datos y cuenta — gratis, al momento, sin ninguna solicitud. Borra tu cuenta desde esa misma pantalla. Puedes reclamar ante tu propia autoridad de control: la ANSPDCP en Rumanía, la CNIL en Francia, la AEPD en España, la ICO en el Reino Unido, o la equivalente donde vivas. [DRAFT — el asesor jurídico debe confirmar que la lista se corresponde con los mercados de lanzamiento y añadir la autoridad principal una vez se determine el establecimiento principal.]',
      },
      {
        heading: 'Menores',
        body: 'ROUNDS no es para nadie por debajo de la edad legal para beber en su región y no recogemos a sabiendas datos de esas personas. Si crees que un menor tiene una cuenta, escribe a privacy@rounds.app y la eliminaremos.',
      },
      {
        heading: 'Cambios en esta política',
        body: 'Si cambiamos esta política de forma sustancial te lo diremos en la app antes de que el cambio surta efecto, y la fecha que hay arriba de esta página refleja siempre la versión vigente.',
      },
      {
        heading: 'Ayuda',
        body: 'Si beber te está causando problemas, la pantalla Bienestar enlaza con recursos de ayuda para tu región. Nada de lo que le cuentas a ROUNDS se comparte con nadie fuera de tu cuenta.',
      },
    ],
  },

  support: {
    title: 'Ayuda con el alcohol',
    updated: UPDATED,
    sections: [
      {
        heading: 'Si deja de ser divertido',
        body: 'Hablar con alguien sobre la bebida es algo normal, y no hace falta que antes haya una crisis. Tu médico de cabecera es una primera llamada razonable, y la mayoría de los países tienen una línea gratuita y confidencial.',
      },
      {
        heading: 'Rumanía',
        body: 'Alianța Română de Prevenire a Sinuciderii · 0800 801 200. Emergencias: 112.',
      },
      {
        heading: 'Reino Unido e Irlanda',
        body: 'Drinkline · 0300 123 1110. Alcoholics Anonymous · 0800 9177 650. Emergencias: 999 / 112.',
      },
      {
        heading: 'Francia',
        body: 'Alcool Info Service · 0 980 980 930, anónimo, sin sobrecoste, de 8 de la mañana a 2 de la madrugada todos los días. Emergencias: 112.',
      },
      {
        heading: 'España',
        body: 'Fad Juventud · 900 16 15 15, gratuito y confidencial. Alcohólicos Anónimos · 985 566 345. Emergencias: 112.',
      },
      {
        heading: 'Unión Europea',
        body: 'Emergencias: 112. Tu servicio nacional de salud tendrá el listado de los servicios locales de alcohol.',
      },
      {
        heading: 'Estados Unidos',
        body: 'SAMHSA National Helpline · 1-800-662-4357, gratuito y confidencial, 24/7. Emergencias: 911.',
      },
    ],
  },
};
