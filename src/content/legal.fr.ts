import type { LegalDoc } from './legal';

/**
 * Version française des documents juridiques de ROUNDS.
 *
 * CECI EST UN BROUILLON DESTINÉ À L'AVOCAT, PAS UN CONSEIL JURIDIQUE. Ne rien
 * publier sans relecture.
 *
 * C'est la version anglaise (`legal.ts`) qui fait foi. Cette traduction existe
 * pour que chacun puisse lire ses propres conditions dans sa langue ; en cas de
 * divergence, c'est l'anglais qui l'emporte, et chaque document le dit dès la
 * première ligne (voir `PREVAILS` dans `legal.ts`).
 *
 * Les marqueurs [DRAFT — …] survivent à la traduction : une clause que l'avocat
 * n'a pas tranchée n'est tranchée dans aucune langue. Le mot « DRAFT » reste en
 * anglais — c'est le marqueur littéral que l'app recherche pour afficher le
 * bandeau d'avertissement (voir `app/legal/[doc].tsx`).
 *
 * Les titres de section, leur ordre et la date de mise à jour sont identiques à
 * l'anglais. Aucun chiffre, aucun âge, aucun délai et surtout aucun numéro de
 * téléphone n'a été modifié, reformaté ni localisé.
 */

const UPDATED = 'September 2026';

export const FR: Record<string, LegalDoc> = {
  terms: {
    title: "Conditions d'utilisation",
    updated: UPDATED,
    sections: [
      {
        heading: "Ce qu'est ROUNDS",
        body: "ROUNDS est un compagnon de soirée. Il enregistre ce que tu lui dis, estime ton rythme de consommation, t'aide à garder ton groupe ensemble et t'aide à rentrer. Ce n'est pas un dispositif médical, pas un éthylotest, et pas une source de conseils sur ton aptitude à conduire ou à utiliser quoi que ce soit.",
      },
      {
        heading: "L'estimation du rythme — lis celle-ci",
        body: "Tout taux d'alcoolémie affiché dans ROUNDS est une ESTIMATION produite à partir de ce que tu as noté, de tes données corporelles de base et de moyennes de population. Elle ne peut pas tenir compte de la nourriture, des médicaments, d'une maladie, du métabolisme individuel, de la force de ce qu'on t'a réellement servi, ni d'un verre que tu as oublié de noter. Elle peut se tromper dans les deux sens, et c'est souvent le cas. Ne l'utilise jamais pour décider si tu dois conduire, et ne compte jamais dessus pour décider si toi ou quelqu'un d'autre êtes en sécurité. Si tu as bu, ne conduis pas.",
      },
      {
        heading: 'Les fonctions de sécurité ne sont pas un service de sécurité',
        body: "Le signe de vie de bonne arrivée envoie un message aux contacts que tu as choisis, si tu ne donnes pas signe de vie. C'est une commodité, pas un service d'urgence. Il dépend de ton téléphone, de ta batterie, de ton signal et du fait que tes contacts soient joignables, et chacun de ces éléments peut faillir. Il ne contacte pas les services d'urgence, et il n'est surveillé par personne. En cas d'urgence, appelle le 112 (UE/Royaume-Uni), le 911 (États-Unis) ou ton numéro local.",
      },
      {
        heading: 'Âge',
        body: "ROUNDS est réservé aux adultes ayant l'âge légal pour boire dans leur région — 18 ans dans l'UE, au Royaume-Uni et en Roumanie, 21 ans aux États-Unis. Nous vérifions la date de naissance à l'inscription et nous stockons le résultat sur nos serveurs, donc réinstaller l'app ne la réinitialise pas. Fournir une fausse date de naissance constitue une violation de ces conditions et nous fermerons le compte.",
      },
      {
        heading: 'Ton compte et ton comportement',
        body: "Tu es responsable de ce que tu publies dans les soirées partagées et les discussions de bande. Le harcèlement, l'usurpation d'identité, les contenus qui sexualisent des mineurs et tout ce qui met une personne en danger sont interdits et entraîneront la fermeture du compte. Tu peux bloquer et signaler n'importe qui depuis son profil; les signalements sont examinés par une personne, en général sous 24 heures. Tu peux supprimer ton compte à tout moment depuis Réglages › Données & compte.",
      },
      {
        heading: 'Ce que nous pouvons faire',
        body: "Nous pouvons suspendre ou fermer un compte qui enfreint ces conditions, et nous pouvons retirer les contenus qui les enfreignent. Nous te dirons pourquoi, sauf si cela mettait quelqu'un en danger ou enfreignait une obligation légale. Nous pouvons modifier ces conditions; les modifications substantielles sont notifiées dans l'app au moins 30 jours avant leur entrée en vigueur, et continuer à utiliser ROUNDS après cela vaut acceptation.",
      },
      {
        heading: 'Paiements',
        body: "ROUNDS est actuellement gratuit et ne propose rien à la vente. Il n'y a pas d'abonnement, pas d'achat intégré et aucun prix nulle part dans l'app. Les fonctions de sécurité sont gratuites pour toujours et ne seront jamais placées derrière un paiement de quelque nature que ce soit. [DRAFT — cette clause est rédigée pour l'app TELLE QU'ELLE EST LIVRÉE. Si une formule payante est introduite, remplacer cette section par les conditions d'abonnement figurant dans la note de rédaction ci-dessous plutôt que de modifier celle-ci, et donner le préavis de 30 jours exigé par « Modifications de ces conditions ».] [DRAFT — conditions d'abonnement à rétablir lorsque la facturation sera livrée : renouvellement automatique jusqu'à résiliation; résiliation et remboursements gérés par l'App Store ou Google Play selon leurs propres politiques et non par nous; le droit de rétractation légal de 14 jours dans l'UE et au Royaume-Uni et la façon dont il s'exerce via la boutique; et la confirmation que la sécurité reste en dehors de toute formule payante.]",
      },
      {
        heading: 'Notre propriété intellectuelle, et la tienne',
        body: "Le nom ROUNDS, l'app, son interface, ses visuels et ses illustrations de verres nous appartiennent et te sont concédés sous licence pour un usage personnel et non commercial de l'app. Tu gardes tout ce que tu écris et téléverses. En publiant du contenu dans une soirée partagée ou dans une bande, tu nous donnes une licence pour le stocker et le montrer aux personnes avec qui tu l'as partagé, aussi longtemps que tu l'y laisses et pas plus longtemps. [DRAFT — l'avocat doit fixer la formulation de la licence, confirmer si une licence plus large est nécessaire pour un quelconque usage promotionnel (nous préférerions que non), et vérifier la situation de la marque « ROUNDS » sur chaque marché de lancement.]",
      },
      {
        heading: 'Responsabilité',
        body: "ROUNDS est fourni en l'état et selon disponibilité. Dans toute la mesure permise par la loi, nous excluons les garanties implicites et nous ne sommes pas responsables des dommages indirects ou consécutifs, de la perte de bénéfices, ni de la perte de données. Notre responsabilité totale envers toi pour l'ensemble des réclamations sur une période de douze mois est limitée à [DRAFT — plafond à fixer par l'avocat : le montant que tu nous as payé sur cette période, ou un plancher fixe pour un utilisateur gratuit, ou les deux, selon ce qui convient à chaque marché]. Rien dans ces conditions ne limite ni n'exclut la responsabilité en cas de décès ou de dommage corporel causé par une négligence, en cas de fraude ou de déclaration frauduleuse, ni pour tout ce qui ne peut pas être limité légalement. Si tu es un consommateur, tes droits légaux ne sont pas affectés et rien ici ne les supplante. [DRAFT — l'avocat doit confirmer que la liste d'exclusions résiste au UK Consumer Rights Act 2015 et à la directive européenne sur les clauses abusives (EU Unfair Terms Directive) sur chaque marché de lancement, et indiquer si une clause distincte pour les utilisateurs professionnels est nécessaire.]",
      },
      {
        heading: 'Droit et litiges',
        body: "Avant toute démarche formelle, écris à hello@rounds.app; la plupart des choses se règlent comme ça et nous répondrons sous [DRAFT — délai de réponse, à fixer par l'avocat]. Ces conditions sont régies par le droit de [DRAFT — droit applicable, à fixer par l'avocat], et les tribunaux de [DRAFT — for compétent, à fixer par l'avocat] sont compétents. Si tu es un consommateur résidant dans l'UE ou au Royaume-Uni, cela ne te prive pas de la protection des règles impératives de ton propre pays, et tu peux engager une procédure devant tes propres tribunaux. Les consommateurs de l'UE peuvent aussi utiliser la plateforme de règlement en ligne des litiges de la Commission européenne à l'adresse ec.europa.eu/consumers/odr. [DRAFT — l'avocat doit fixer le droit applicable et le for pour chaque marché de lancement, confirmer que le lien ODR est toujours exigé et à jour au moment de la publication, et indiquer si une clause d'arbitrage et une renonciation aux recours collectifs sont appropriées pour les États-Unis et exécutoires compte tenu de la position du consommateur ailleurs.]",
      },
      {
        heading: 'Modifications de ces conditions',
        body: "Nous pouvons modifier ces conditions. Les modifications substantielles sont notifiées dans l'app au moins 30 jours avant leur entrée en vigueur, et continuer à utiliser ROUNDS après cette date vaut acceptation. Si tu n'acceptes pas une modification, tu peux supprimer ton compte depuis Réglages › Données & compte et tes données sont effacées conformément à la politique ci-dessous.",
      },
      {
        heading: 'Contact',
        body: "ROUNDS est exploité par [DRAFT — dénomination sociale complète et adresse du siège, qui doivent correspondre exactement à la Politique de confidentialité et aux deux fiches des boutiques]. Écris à hello@rounds.app pour n'importe quoi, ou à privacy@rounds.app au sujet de tes données; nous répondons à l'adresse depuis laquelle tu écris. Les signalements de harcèlement ou de tout ce qui met une personne en danger sont examinés par une personne, en général sous 24 heures, et tu peux aussi signaler depuis n'importe quel profil dans l'app.",
      },
    ],
  },

  privacy: {
    title: 'Politique de confidentialité',
    updated: UPDATED,
    sections: [
      {
        heading: 'Qui nous sommes',
        body: "Le responsable du traitement des données personnelles décrites dans cette politique est [DRAFT — dénomination sociale complète], une [DRAFT — forme juridique, p. ex. SRL] immatriculée en [DRAFT — pays d'immatriculation] sous le numéro [DRAFT — numéro d'immatriculation de la société], à [DRAFT — adresse du siège]. Tu peux nous joindre à privacy@rounds.app. [DRAFT — l'avocat doit confirmer si un délégué à la protection des données est requis au titre de l'article 37 et, le cas échéant, ajouter ici ses coordonnées; et si un représentant dans l'UE au titre de l'article 27 et un représentant au Royaume-Uni sont requis, en ajoutant chacun avec une adresse postale. Ces mêmes informations doivent correspondre aux fiches des boutiques et aux Conditions.]",
      },
      {
        heading: 'La version courte',
        body: "Nous stockons ce que tu notes pour que l'app puisse te le remontrer. L'estimation de l'alcoolémie est calculée sur ton téléphone et n'est jamais envoyée nulle part. Tes amis peuvent voir que tu es sorti, jamais ce que tu as bu. Nous ne vendons pas tes données, nous ne les partageons pas à des fins publicitaires, et il n'y a pas de publicité dans ROUNDS. Tu peux tout exporter ou supprimer ton compte depuis Réglages › Données & compte, immédiatement et sans nous le demander.",
      },
      {
        heading: 'Ce que nous stockons, et pourquoi',
        body: "Ton profil (nom affiché, nom d'utilisateur, avatar) pour que tes amis puissent te trouver — nécessaire à l'exécution du contrat. Ce que tu notes, tes soirées, tes plans et tes réglages — nécessaires à la fourniture du service. Les données corporelles de base (sexe et poids), seulement si tu les donnes, et uniquement pour calculer l'estimation du rythme sur ton appareil — ce sont des données relatives à la santé et nous les traitons uniquement sur la base de ton consentement explicite, que tu peux retirer en effaçant ces champs. La date de naissance, pour vérifier l'âge légal pour boire — une obligation légale. Des événements de diagnostic, qui portent des compteurs et des catégories et jamais le nom d'un verre, d'un lieu ou d'une personne.",
      },
      {
        heading: 'Ce qui ne quitte jamais ton téléphone',
        body: "L'estimation de l'alcoolémie est calculée sur ton appareil et n'est jamais stockée sur nos serveurs ni transmise nulle part. La mise en correspondance des contacts hache les numéros de téléphone sur ton appareil avec un sel; seuls les hachages sont envoyés, et nous ne conservons pas ta liste de contacts. Ton adresse de domicile, utilisée pour préremplir un trajet de retour, est stockée uniquement sur l'appareil.",
      },
      {
        heading: 'Localisation',
        body: "La localisation sert à afficher les lieux près de toi et n'est pas stockée sur nos serveurs à cette fin. Le partage de ta localisation en direct avec une soirée se fait sur activation, soirée par soirée, n'est visible que par les personnes de cette soirée, et est supprimé automatiquement à la fin de la soirée — la ligne est effacée, pas simplement masquée. Nous ne demandons jamais la localisation en arrière-plan.",
      },
      {
        heading: "Qui d'autre le voit",
        body: "Rien de ce qui concerne ta consommation n'est partagé avec qui que ce soit à moins que tu ne le partages. Un ami peut voir que tu es sorti et dans quels lieux, uniquement si tu règles une soirée comme visible par les amis. Un ami ne voit jamais ce que tu as bu, en quelle quantité, ton rythme, tes séries ni tes dépenses. Nous ne vendons pas de données personnelles, nous ne les partageons pas à des fins publicitaires, et il n'y a pas de publicité dans ROUNDS.",
      },
      {
        heading: 'Bases légales',
        body: "Contrat : ton profil, tes enregistrements, tes soirées, tes plans et tes réglages — nous ne pouvons pas fournir l'app sans eux. Consentement explicite (article 9(2)(a)) : ton sexe et ton poids, qui relèvent de la santé et servent uniquement à calculer l'estimation du rythme sur ton appareil; retire-le en effaçant ces champs, ce qui arrête l'estimation et rien d'autre. Obligation légale : ta date de naissance, pour vérifier l'âge légal pour boire. Intérêts légitimes : la sécurité du service, la prévention des abus, et les événements de diagnostic qui ne portent que des compteurs et des catégories — tu peux t'opposer à ces derniers dans Réglages › Confidentialité. [DRAFT — l'avocat doit confirmer la base de l'article 9 pour les données corporelles et indiquer si une évaluation des intérêts légitimes doit être consignée et résumée ici.]",
      },
      {
        heading: 'Sous-traitants ultérieurs',
        body: "Supabase — base de données, authentification et stockage de fichiers, hébergés dans l'UE. Expo — envoi des notifications push. [DRAFT — nom du fournisseur SMS], utilisé uniquement pour envoyer une escalade de bonne arrivée aux contacts que tu as choisis. [DRAFT — l'avocat doit compléter cette liste avant le lancement et, pour chaque entrée, consigner : la dénomination sociale du sous-traitant, ce qu'il traite, où il le traite, et le mécanisme de transfert pour tout ce qui sort de l'EEE ou du Royaume-Uni (clauses contractuelles types plus une analyse d'impact du transfert, ou une décision d'adéquation). L'avocat doit se prononcer sur la publication de cette liste à l'adresse rounds.app/subprocessors avec un engagement de préavis avant l'ajout d'un nouveau sous-traitant, ce qui est la forme attendue par les évaluateurs en entreprise et par les boutiques.]",
      },
      {
        heading: 'Comment nous les protégeons',
        body: "Les données sont chiffrées en transit et au repos. L'accès à tes lignes est appliqué par la base de données elle-même plutôt que par l'app, de sorte qu'un bug dans le client ne peut pas montrer tes données à quelqu'un d'autre. Personne chez ROUNDS ne lit tes enregistrements. [DRAFT — l'avocat doit confirmer la formulation de notification de violation exigée par les articles 33 et 34, et indiquer si un engagement précis sur les délais de notification doit figurer ici.]",
      },
      {
        heading: 'Pas de profilage, pas de décisions automatisées',
        body: "Rien dans ROUNDS ne prend, à ton sujet, de décision produisant des effets juridiques ou t'affectant de manière significative de façon similaire, et nous ne te profilons pas à des fins publicitaires. L'estimation du rythme et les messages de bien-être sont calculés sur ton propre appareil à partir de ce que tu as noté, et ce sont des informations pour toi, pas un jugement enregistré à ton sujet.",
      },
      {
        heading: 'Combien de temps nous les conservons',
        body: "Tes enregistrements et tes soirées sont conservés jusqu'à ce que tu les supprimes ou que tu supprimes ton compte. La suppression de ton compte ouvre un délai de grâce de 30 jours, après quoi tout est effacé par une cascade côté serveur; tu es déconnecté immédiatement. La localisation en direct expire en quelques heures. Les événements de diagnostic sont conservés 12 mois. Les signalements de modération sont conservés 24 mois pour que les comportements répétés puissent être reconnus.",
      },
      {
        heading: 'Tes droits',
        body: "En vertu du RGPD et du UK GDPR, tu peux accéder à tes données, les rectifier, les effacer, en limiter le traitement, t'y opposer et les porter ailleurs. Exporte tout au format JSON depuis Réglages › Données & compte — gratuitement, immédiatement, sans aucune demande à faire. Supprime ton compte depuis le même écran. Tu peux introduire une réclamation auprès de ta propre autorité de contrôle : l'ANSPDCP en Roumanie, la CNIL en France, l'AEPD en Espagne, l'ICO au Royaume-Uni, ou l'équivalent là où tu vis. [DRAFT — le conseil doit confirmer que cette liste correspond aux marchés de lancement et ajouter l'autorité chef de file une fois l'établissement principal déterminé.]",
      },
      {
        heading: 'Enfants',
        body: "ROUNDS n'est pas destiné à quiconque n'a pas l'âge légal pour boire dans sa région et nous ne collectons pas sciemment de données auprès de ces personnes. Si tu penses qu'un mineur a un compte, écris à privacy@rounds.app et nous le supprimerons.",
      },
      {
        heading: 'Modifications de cette politique',
        body: "Si nous modifions cette politique de façon substantielle, nous te le dirons dans l'app avant que la modification prenne effet, et la date en haut de cette page reflète toujours la version en vigueur.",
      },
      {
        heading: 'Aide',
        body: "Si l'alcool te pose des problèmes, l'écran Bien-être renvoie vers des ressources d'aide pour ta région. Rien de ce que tu dis à ROUNDS n'est partagé avec qui que ce soit en dehors de ton compte.",
      },
    ],
  },

  support: {
    title: "Aide sur l'alcool",
    updated: UPDATED,
    sections: [
      {
        heading: "Si ce n'est plus drôle",
        body: "Parler à quelqu'un de sa consommation d'alcool est une chose normale, et il n'est pas nécessaire d'attendre une crise. Ton médecin traitant est un premier appel raisonnable, et la plupart des pays ont une ligne gratuite et confidentielle.",
      },
      {
        heading: 'Roumanie',
        body: 'Alianța Română de Prevenire a Sinuciderii · 0800 801 200. Urgences : 112.',
      },
      {
        heading: 'Royaume-Uni et Irlande',
        body: 'Drinkline · 0300 123 1110. Alcoholics Anonymous · 0800 9177 650. Urgences : 999 / 112.',
      },
      {
        heading: 'France',
        body: 'Alcool Info Service · 0 980 980 930, anonyme, non surtaxé, de 8h à 2h du matin tous les jours. Urgences : 112.',
      },
      {
        heading: 'Espagne',
        body: 'Fad Juventud · 900 16 15 15, gratuit et confidentiel. Alcohólicos Anónimos · 985 566 345. Urgences : 112.',
      },
      {
        heading: 'Union européenne',
        body: 'Urgences : 112. Ton service national de santé recense les services locaux en alcoologie.',
      },
      {
        heading: 'États-Unis',
        body: 'SAMHSA National Helpline · 1-800-662-4357, gratuit et confidentiel, 24/7. Urgences : 911.',
      },
    ],
  },
};
