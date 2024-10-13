import { Dimensions } from "react-native";

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

export const hp = percentage => {
    return (percentage * deviceHeight) / 100;
}
export const wp = percentage => {
    return (percentage * deviceWidth) / 100;
}

export const stripHtmlTags = (html) => {
    // Supprimer les balises HTML
    let text = html.replace(/<[^>]*>?/gm, '');

    // Remplacer les entités HTML comme &nbsp; par leur équivalent
    text = text.replace(/&nbsp;/g, ' ');  // Remplace &nbsp; par un espace normal
    text = text.replace(/&amp;/g, '&');   // Remplace &amp; par &
    text = text.replace(/&quot;/g, '"');  // Remplace &quot; par "
    text = text.replace(/&#39;/g, "'");   // Remplace &#39; par '
    text = text.replace(/&lt;/g, '<');    // Remplace &lt; par <
    text = text.replace(/&gt;/g, '>');    // Remplace &gt; par >

    return text;
};

