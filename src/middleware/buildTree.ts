import { User } from "../entity/User";

export function buildTree(users: User[]): User[] {
    const tree: User[] = [];
    const map: { [key: number]: User & { children: User[] } } = {}; // Map to hold all nodes with children

    // Create a map to hold all users with an initialized children array
    users.forEach(user => {
        map[user.id] = { 
            ...user, 
            children: [],
        };
    });

    // Build the tree structure
    users.forEach(user => {
        if (user.parentId === null) {
            // If there's no parent, it’s a root user
            tree.push(map[user.id]);
        } else {
            // If there's a parent, add the user to the parent's children
            if (map[user.parentId]) {
                map[user.parentId].children.push(map[user.id]); // Add the user to the parent's children array
            }
        }
    });

    return tree;
}