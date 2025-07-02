// services/friendsService.js

const BASE_URL = 'https://backend-fswq.onrender.com/friends'; // adapte l'IP

// 1. Envoyer une demande d’amitié
export async function sendFriendRequest(senderId, receiverId) {
  try {
    const res = await fetch(`${BASE_URL}/send-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Erreur lors de l’envoi');
    return data;
  } catch (error) {
    throw new Error(error.message || 'Erreur réseau');
  }
}

// 2. Accepter une demande d’amitié
export async function acceptFriendRequest(senderId, receiverId) {
  try {
    const res = await fetch(`${BASE_URL}/accept-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Erreur lors de l’acceptation');
    return data;
  } catch (error) {
    throw new Error(error.message || 'Erreur réseau');
  }
}

// 3. Refuser une demande d’amitié
export async function rejectFriendRequest(senderId, receiverId) {
  try {
    const res = await fetch(`${BASE_URL}/reject-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Erreur lors du refus');
    return data;
  } catch (error) {
    throw new Error(error.message || 'Erreur réseau');
  }
}

// 4. Récupérer la liste des amis d’un utilisateur
export async function getMyFriends(userId) {
  try {
    const res = await fetch(`${BASE_URL}/my-friends/${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Erreur lors du chargement des amis');
    return data.friends;
  } catch (error) {
    throw new Error(error.message || 'Erreur réseau');
  }
}

// 5. Bloquer un utilisateur
export async function blockUser(blockerId, blockedId) {
  try {
    const res = await fetch(`${BASE_URL}/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocker_id: blockerId, blocked_id: blockedId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Erreur de blocage');
    return data;
  } catch (error) {
    throw new Error(error.message || 'Erreur réseau');
  }
}

// 6. S’abonner à un utilisateur (follow)
export async function followUser(followerId, followingId) {
  try {
    const res = await fetch(`${BASE_URL}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ follower_id: followerId, following_id: followingId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Erreur follow');
    return data;
  } catch (error) {
    throw new Error(error.message || 'Erreur réseau');
  }
}

// 7. Récupérer la liste des abonnements (followings) d’un utilisateur
export async function getMyFollowings(userId) {
  try {
    const res = await fetch(`${BASE_URL}/my-followings/${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Erreur');
    return data.following;
  } catch (error) {
    throw new Error(error.message || 'Erreur réseau');
  }
}

// 8. Récupérer la liste des abonnés (followers) d’un utilisateur
export async function getMyFollowers(userId) {
  try {
    const res = await fetch(`${BASE_URL}/my-followers/${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Erreur');
    return data.followers;
  } catch (error) {
    throw new Error(error.message || 'Erreur réseau');
  }
}
